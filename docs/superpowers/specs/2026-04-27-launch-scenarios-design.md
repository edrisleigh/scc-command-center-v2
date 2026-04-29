# Launch Scenarios — Design Spec

**Date:** 2026-04-27
**Status:** Design approved, awaiting implementation plan
**Author:** edrisa@halo.agency (with Claude)

---

## Summary

Replace the standalone Excel template `___Template____TTS Launch Scenarios.xlsx` with an in-app, multi-tenant Launch Scenarios feature. The agency uses this artifact to pitch prospective TikTok Shop clients on a 6-month launch plan modeled across four trajectory scenarios (Conservative, Balanced, Aggressive, Rapid Scale). Once a prospect signs and a scenario is picked, the locked plan becomes the source of truth for downstream Planning, Scorecards, and Strategy Levers work (all separate future specs).

This spec covers Launch Scenarios end-to-end. It deliberately stops at "scenario locked & saved." The hand-off interface for downstream consumers is documented but their pages are not designed here.

## Why

The current Excel-driven workflow lives outside the dashboard, can't be linked to a client record, and produces a static artifact. Halo wants:

- A single source of truth for each client's launch plan that the Planning page can later consume as the "goal column."
- A pitch-time model that lives in-app for prospects (no client record yet) and gets linked to a client when they sign.
- A visual comparison of the four scenarios that reads as a dashboard, not a spreadsheet.

## Scope

### In scope
- Agency-level pages to list and edit launch scenarios for prospects and clients
- A read-only client-scoped page that surfaces the locked plan once a client is linked
- Pure-function calculation engine that reproduces the Excel's outputs from a small set of inputs
- Persistence via the existing repository pattern (mock adapter for now)
- Mock fixture with one HEYDUDE example that reproduces the Excel's numbers

### Out of scope
- Unlocking a locked scenario (re-pitch creates a new one)
- Audit log of cell-level edits
- Auto-save (explicit save with unsaved-changes indicator)
- PDF export (CSV export is sufficient for v1)
- Multi-user real-time co-editing
- The Planning page (separate spec)
- Strategy Levers (separate spec)
- Scorecard variance rendering (separate spec)
- Permissions / auth (disabled app-wide per README)

## Information architecture

### Routes
| Route | Purpose |
|---|---|
| `/$orgSlug/launch-scenarios` | List of all scenarios (drafts + locked) for the org |
| `/$orgSlug/launch-scenarios/$scenarioId` | View / edit a specific launch scenario |
| `/$orgSlug/$clientSlug/launch` | Read-only "Launch Plan" — only available when a locked scenario is linked to this client |

### Sidebar
- **Agency-level sidebar** gains a top-level item under Overview: **Launch Scenarios**.
- **Client-level sidebar** gains an item under Reporting: **Launch Plan** (read-only). Only rendered when a locked scenario is linked to that client.

### Lifecycle states
```
draft  →  locked  →  linked-to-client
```

- A scenario starts as `draft` (editable).
- When the strategist picks one of the four scenarios and confirms, it becomes `locked` (immutable).
- When the prospect signs and is added as a client, the scenario's `clientSlug` is populated. Until then it's only addressable via `scenarioId`.
- Re-pitch = new scenario document, not editing a locked one.

## Data model

```ts
interface LaunchScenario {
  id: string
  orgSlug: string                // 'halo'
  clientSlug: string | null      // null while prospecting
  prospectName: string           // 'HEYDUDE' — used in UI until clientSlug is set
  name: string                   // 'HEYDUDE Q2 2026 Launch'
  status: 'draft' | 'locked'
  chosenScenarioKey: ScenarioKey | null
  sharedInputs: SharedInputs
  scenarios: Record<ScenarioKey, ScenarioInputs>
  createdAt: string              // ISO
  updatedAt: string              // ISO
  lockedAt: string | null
  lockedBy: string | null        // userId, null in this app since auth is disabled
}

type ScenarioKey = 'conservative' | 'balanced' | 'aggressive' | 'rapid_scale'

interface SharedInputs {
  aov: number                    // 99.99
  cogsPercent: number            // 0.20 (COGS = aov * cogsPercent)
  shippingPerUnit: number        // 7.00
  creatorCommissionPct: number   // 0.15
  platformFeePct: number         // 0.06
}

interface ScenarioInputs {
  tts: {
    roas: number[]               // length 6
    adSpend: number[]            // length 6
    adPctOfGmv: number[]         // length 6
    samplesPerMonth: number[]    // length 6 — drives both sample cost AND active-creator growth
    videosPerCreator: number[]   // length 6 — Excel template uses [3, 2.4, 3, 3, 3, 3] for Conservative
    creatorIncentives: number[]  // length 6 — varies per scenario per month (e.g. Aggressive ramps from $10K to $20K)
  }
  dtc: {
    googleAdSpend: number[]      // length 6
    metaAdSpend: number[]        // length 6
    googleRoas: number[]         // length 6
    metaRoas: number[]           // length 6
  }
  amazonMultiplierVsTts: number  // 0.30 default
}
```

**Constants kept in code (not persisted, rarely change):**

```ts
AGENCY_COMMISSION_PCT  = 0.05      // 5% of TTS GMV
AGENCY_RETAINER_TTS    = 11_900    // $/month
AGENCY_RETAINER_DTC    = 5_000     // $/month
VIEWS_PER_VIDEO        = 4_993
CLICKS_PER_VIDEO       = 330
CREATOR_RETENTION_RATE = 0.98      // month-over-month retention; (samples + prior_active) * 0.98
```

> Note: an earlier draft of this spec listed `CREATOR_INCENTIVES = 5_000` as a constant. Implementation surfaced that the Excel actually varies it per scenario per month (Conservative $5K flat; Balanced ramps $7.5K → $10K; Aggressive $10K → $20K; Rapid Scale $15K → $30K). It was promoted to a per-month input on `ScenarioInputs.tts`.

## Module structure

```
src/modules/launch/
├── types.ts                          // LaunchScenario, SharedInputs, ScenarioInputs, ScenarioOutputs
├── constants.ts                      // The constants above
├── calc.ts                           // Pure: computeScenario, computeAllScenarios
├── defaults.ts                       // Default per-scenario monthly curves (lifted from Excel sheets 2-5)
├── hooks.ts                          // useLaunchScenarios, useLaunchScenario, useLockScenario, useSaveScenario
└── components/
    ├── launch-list.tsx               // List page body
    ├── shared-inputs-panel.tsx       // 5 brand-economic inputs (inline editable)
    ├── scenario-summary-card.tsx     // One card in the 4-up grid
    ├── scenario-comparison-chart.tsx // Recharts line chart of net-profit trajectories
    ├── scenario-editor-drawer.tsx    // Side-panel with monthly grid (4 tabs)
    └── lock-scenario-dialog.tsx      // Confirm dialog for locking

src/data/
├── repositories/types.ts             // + LaunchRepository interface
├── adapters/mock/launch.ts           // Reads/writes fixture JSON
└── fixtures/launch-scenarios.json    // Seed: HEYDUDE example matching the Excel outputs

src/routes/$orgSlug/
├── launch-scenarios/
│   ├── index.tsx                     // List page
│   └── $scenarioId.tsx               // Detail page
└── $clientSlug/
    └── launch.tsx                    // Read-only client-scoped Launch Plan
```

## Page layouts

### List page (`/$orgSlug/launch-scenarios`)
- Header: page title + "+ New launch scenario" button
- Table: Brand/Prospect, Status badge, Chosen scenario, Projected 6-mo profit, Last updated, "Open" link
- Empty state for first-time use
- "+ New launch scenario" opens a modal that asks for `prospectName` (required) and creates a draft seeded with default templates, then redirects to the detail page

### Detail page (`/$orgSlug/launch-scenarios/$scenarioId`)
The comparison-first dashboard. Vertical stack:

1. **Topbar**: name + status badge + "Export CSV" + "Lock plan" button (disabled until a scenario is picked) + "Unsaved changes" indicator when dirty
2. **Brand-economics row**: 5 inline-editable inputs (AOV, COGS%, Shipping/unit, Creator commission %, Platform fee %). Edits trigger live recalc of all four scenarios.
3. **4-up scenario summary cards**: each shows GMV, Orders, Net profit, CM% as 6-month totals + a sparkline of monthly net profit + "Edit" and "Pick" buttons. The picked one shows a ★ badge.
4. **Comparison chart**: Recharts line chart, 4 series, monthly net profit
5. **Comparison table**: side-by-side 6-month rollups (TTS GMV, new customers, videos, video views, DTC revenue, Amazon halo, Net profit). Highest in each row gets a "best" highlight.

### Editor side-panel (drawer)
Slides in from the right when a scenario card's "Edit" is clicked. The detail page stays visible underneath (faded).

- Header: scenario name + "live recalc" pill + close
- Tabs: TikTok Shop / DTC / Amazon / Outputs (read-only summary of all calculated values)
- Body: a 7-column grid (label + M1..M6). Input rows highlighted (editable); output rows derived (read-only).
- Footer: "Reset to template" (restores defaults for that scenario) + "Apply" (commits to in-memory document)
- Live recalc on every keystroke

### Read-only Launch Plan page (`/$orgSlug/$clientSlug/launch`)
Stub for the future Planning spec. Shows:
- Topbar with the locked scenario name and chosen scenario tag
- The same comparison cards but read-only, with the chosen scenario emphasized
- Link back to `/orgSlug/launch-scenarios/scenarioId` for full detail

## Calculation engine

Pure functions in `src/modules/launch/calc.ts`. No I/O, no React, no global state.

### Public API
```ts
function computeScenario(
  inputs: ScenarioInputs,
  shared: SharedInputs,
): ScenarioOutputs

function computeAllScenarios(
  doc: LaunchScenario,
): Record<ScenarioKey, ScenarioOutputs>
```

### `ScenarioOutputs` shape
All arrays length 6 (one per month) unless noted.

```
tts:
  gmv                = (adSpend * roas) / adPctOfGmv
  orders             = gmv / aov
  cogs               = orders * (aov * cogsPercent)
  shipping           = orders * shippingPerUnit
  productMargin      = gmv - cogs - shipping
  creatorCommission  = gmv * creatorCommissionPct
  platformFee        = gmv * platformFeePct
  agencyCommission   = gmv * AGENCY_COMMISSION_PCT
  contributionMargin = productMargin - creatorCommission - platformFee - agencyCommission - adSpend
  contributionPct    = contributionMargin / gmv
  sampleCost         = samples * (aov * cogsPercent + shippingPerUnit)
  platformProfit     = contributionMargin - sampleCost - creatorIncentives - AGENCY_RETAINER_TTS
  preRetainerProfit  = contributionMargin - sampleCost - creatorIncentives
  cumulativeInvest   = running sum of negative platformProfit while it remains < 0
  activeCreators[m1] = samplesPerMonth[m1]
  activeCreators[mN] = (samplesPerMonth[mN] + activeCreators[mN-1]) * CREATOR_RETENTION_RATE
                       // samples sent IS the lever for adding active creators each month;
                       // 0.98 retention is the implicit churn baked into the Excel formula
  videos             = activeCreators * videosPerCreator
  videoViews         = videos * VIEWS_PER_VIDEO
  clicks             = videos * CLICKS_PER_VIDEO

dtc:
  googleRevenue      = googleAdSpend * googleRoas
  metaRevenue        = metaAdSpend * metaRoas
  incrementalRev     = googleRevenue + metaRevenue
  orders             = incrementalRev / aov
  cogs, shipping, productMargin (same shapes as TTS)
  platformProfit     = productMargin - AGENCY_RETAINER_DTC

amazon:
  revenue            = tts.gmv * amazonMultiplierVsTts
  orders             = revenue / aov
  cogs, shipping, productMargin (same shapes as TTS)

netProfit            = tts.platformProfit + dtc.productMargin + amazon.productMargin
                       // ASYMMETRIC BY DESIGN: TTS contributes platformProfit (post-retainer)
                       // but DTC contributes productMargin (PRE-retainer). The Excel template
                       // tracks the DTC retainer in dtc.platformProfit for reporting but
                       // deliberately excludes it from the rolled-up net profit. Switching
                       // DTC to platformProfit shifts the total by MONTHS × AGENCY_RETAINER_DTC = $30K.

totals: 6-month sums of: ttsGmv, ttsOrders, videos, videoViews, clicks, dtcRevenue,
        dtcOrders, amazonRevenue, amazonOrders, netProfit
```

### Implementation principles
1. Pure: same inputs → same outputs, no side effects
2. Single pass per scenario: TTS → DTC → Amazon → netProfit
3. No mid-pipeline rounding; round only at render time
4. Negative profits are real (months 1–2 typically negative); never clamp to zero
5. Months are fixed at 6 (matches Excel)

### Default templates
`src/modules/launch/defaults.ts` ships the four template curves with the per-month assumptions lifted verbatim from Excel sheets 2–5. These are the starting point when a new scenario is created. The strategist edits them per brand.

## Lifecycle and behaviors

### Creating a new scenario
1. User clicks "+ New launch scenario"
2. Modal asks for `prospectName` (required) and an optional display name
3. New `LaunchScenario` is created with `status='draft'`, default templates for all four scenarios, and Excel-default `sharedInputs`
4. User is redirected to the detail page

### Editing
- Brand-economics inputs are inline-editable on the detail page
- Per-scenario inputs are edited in the side-panel drawer
- All edits trigger live recalc (pure calc engine, microseconds)
- Changes accumulate in memory until "Save" is clicked. "Unsaved changes" indicator in topbar.
- Drawer "Apply" commits to the in-memory document; drawer "Reset to template" restores that scenario's defaults
- Navigating away with unsaved changes prompts confirmation

### Picking a scenario
- "Pick" button on a card sets `chosenScenarioKey` (in memory)
- Visual badge appears on the picked card
- Picking is reversible until lock

### Locking
- "Lock plan" button in topbar (disabled until a scenario is picked and changes are saved)
- Confirmation dialog summarizes the pick and warns it's irreversible
- On confirm: `status='locked'`, `lockedAt` set, all inputs disabled, the topbar action collapses to "Locked"

### Linking to a client
- A locked scenario without a `clientSlug` shows a "Link to existing client…" action
- Picking a client populates `clientSlug` and makes `/orgSlug/$clientSlug/launch` accessible
- Future automation will do this on signup; for v1 it's manual

### Validation
- All numeric inputs ≥ 0
- ROAS, ad %, multipliers may be 0
- AOV must be > 0 (otherwise division-by-zero in orders calc — show inline error)
- No upper bounds

### Empty / loading / error states
- List empty: "No launch scenarios yet — create your first one to start modeling a brand launch."
- Detail loading: skeletons for cards + chart, matching existing dashboard pattern
- Repository error: red banner at top with a Retry action

### Export
- Topbar "Export CSV" downloads the comparison table (consistent with Shop/Video/Ads pages)
- PDF export deferred

## Hand-off interface for the future Planning spec

The locked `LaunchScenario` document is the contract. Planning will:
1. Look up the locked scenario by `clientSlug`
2. Read `chosenScenarioKey` to find `scenarios[chosenScenarioKey]`
3. Run `computeScenario()` to derive monthly outputs
4. Render those outputs as the "goal column" alongside actuals from Shop/Video/Ads/Creators

No coupling beyond the document shape and the public calc API.

## Testing

`src/modules/launch/__tests__/calc.test.ts`:
- Each of the four default templates reproduces the Excel's 6-month rollup totals within 1% (regression test for formula decoding)
- Edge cases: zero ad spend, zero ROAS, all-zero inputs do not crash
- Shared input changes propagate across all four scenarios

`src/modules/launch/components/__tests__/`:
- `scenario-summary-card.test.tsx`: renders the right KPIs given a scenario output
- `scenario-editor-drawer.test.tsx`: edits to inputs are reflected in outputs (integration with calc engine)
- `lock-scenario-dialog.test.tsx`: confirms behavior of the lock action

`src/data/adapters/mock/__tests__/launch.test.ts`:
- Read/write round-trip preserves the document shape
- Listing returns drafts and locked scenarios

## Open questions for implementation

These don't block the design but are worth flagging for the planning phase:

1. **Default sharedInputs for a new scenario** — currently use Excel defaults (AOV $99.99 etc.). Or should they all start at zero so the strategist is forced to fill them in?
2. **CSV export** — just the comparison table, or also each scenario's full monthly grid?
3. **HEYDUDE seed fixture** — should it be locked or draft? I lean draft so the user can see editing UX out of the box.
