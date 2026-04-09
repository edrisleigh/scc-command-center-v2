# SCC Command Center

A multi-tenant SaaS platform for managing TikTok Shop operations. Built to replace the manual Excel-based "Command Center" workflow used by agencies managing brands on TikTok Shop.

**Current state:** Frontend complete with mock data. Ready for backend API integration.

## Quick Start

```bash
cd scc-command-center-v2
npm install
npm run dev
```

Open http://localhost:5174 — you'll land on the Shop Analytics dashboard for HEYDUDE.

## What This Is

Your agency (Halo) manages TikTok Shop clients like HEYDUDE. Today, the team manually downloads data from TikTok Seller Center, pastes it into a 49-tab Excel file, and builds reports by hand. This app replaces that entire workflow.

**The Excel had 49 tabs. This app has 13 pages that cover all of them:**

| Excel Tabs | App Page | What It Does |
|---|---|---|
| Shop | Shop Analytics | Daily GMV, revenue, orders, visitors, conversion rate, channel splits (LIVE/Video/Product Card) |
| Video Performance | Video Performance | Video GMV, views, GPM, CTR, click-to-order rate, conversion funnel |
| Ads | Ads Management | Ad spend, ROAS, ad-driven GMV, commission tracking, target vs open collabs |
| Creator Management, LIVE Creator Management, Target Collabs, Collaboration Data, Creator Incentives | Creators | Full creator profiles, VIP/Brand POD filtering, LIVE creator metrics, collaboration tracking |
| Paid Content, Free Content, Spark Codes Tracker | Content & Spark | Content submission pipeline, spark code expiration tracking |
| Samples, All Products, Hero Products, Restocks, SKU Detail | Samples & Products | Product catalog, sample order tracking, hero product performance, restock alerts |
| Weekly Scorecard, Monthly Scorecard | Scorecards | Week-over-week and month-over-month KPI rollups |
| Planning, Strategy Levers, Previous OGSMs | Planning & OGSM | Quarterly targets vs actuals with progress bars, strategy task tracking |
| Calendar, TT Calendar | Calendar | Month-view calendar with campaigns, launches, TT promos, internal events |
| NEW Work Flow | Workflow | Daily/weekly task checklists per role with completion tracking |
| — | Data Import | CSV upload wizard to import data (replaces copy-paste into Excel) |
| — | Settings | Organization, client, team, and data source configuration |
| — | Agency Overview | Cross-client KPI summary (at `/halo/overview`) |

## How the App is Organized

### URL Structure (Multi-Tenancy)

```
/:orgSlug/:clientSlug/shop       → Halo Agency > HEYDUDE > Shop Analytics
/:orgSlug/:clientSlug/creators   → Halo Agency > HEYDUDE > Creators
/:orgSlug/overview               → Halo Agency > Agency Overview (all clients)
```

Every page is scoped to an organization (your agency) and a client (the brand). This means when you onboard a new brand, they get their own complete dashboard — same pages, their own data.

### Navigation

The sidebar groups pages into 4 sections:

- **Analytics** — Shop, Video, Ads (daily metrics dashboards)
- **Operations** — Creators, Content & Spark, Samples & Products (manage day-to-day work)
- **Reporting** — Scorecards, Planning & OGSM (track goals and performance)
- **Tools** — Calendar, Workflow, Data Import, Settings (operational tools)

The top bar shows which org/client you're viewing and has a date range picker that controls all analytics pages.

### Data Flow

```
┌─────────────────────────────────┐
│         UI Components           │  React components render the data
│   (KpiCard, Charts, Tables)     │
├─────────────────────────────────┤
│         Query Hooks             │  TanStack Query manages caching/loading
│   (useShopMetrics, etc.)        │
├─────────────────────────────────┤
│       Repository Interface      │  Standard interface for all data access
│   (ShopRepository, etc.)        │
├────────────┬────────────────────┤
│ Mock       │ API Adapter        │  Mock: returns fixture JSON
│ Adapter    │ (future)           │  API: will call your real backend
└────────────┴────────────────────┘
```

**Why this matters:** The UI never talks to the data source directly. It talks to a repository interface. Right now, the "Mock Adapter" returns fixture data from JSON files. When your backend is ready, you create an "API Adapter" that makes real HTTP calls — and nothing in the UI changes.

## Project Structure

```
src/
├── routes/                          # Pages (file-based routing)
│   ├── __root.tsx                   # Root layout (HTML shell, providers)
│   ├── index.tsx                    # / → redirects to /halo/heydude/shop
│   ├── login.tsx                    # Login page (auth disabled for now)
│   └── $orgSlug/
│       ├── overview.tsx             # Agency overview dashboard
│       └── $clientSlug/
│           ├── route.tsx            # Client layout (sidebar + topbar)
│           ├── shop.tsx             # Shop Analytics page
│           ├── videos.tsx           # Video Performance page
│           ├── ads.tsx              # Ads Management page
│           ├── creators.tsx         # Creator Management page
│           ├── content.tsx          # Content & Spark Codes page
│           ├── samples.tsx          # Samples & Products page
│           ├── scorecards.tsx       # Scorecards page
│           ├── planning.tsx         # Planning & OGSM page
│           ├── calendar.tsx         # Calendar page
│           ├── workflow.tsx         # Workflow page
│           ├── import.tsx           # CSV Import page
│           └── settings.tsx         # Settings page
│
├── modules/                         # Feature modules (each owns its domain)
│   ├── shared/                      # Shared across all modules
│   │   ├── components/              # KpiCard, DataTable, TimeSeriesChart,
│   │   │                            # DateRangePicker, Sidebar, Topbar, etc.
│   │   ├── hooks/                   # useTenant, useDateRange, useAgencyOverview
│   │   └── types.ts                 # Organization, Client, User, DateRange
│   ├── shop/
│   │   ├── types.ts                 # ShopDailyMetric
│   │   ├── hooks.ts                 # useShopMetrics
│   │   └── components/              # ShopKpis, ShopChart, ChannelBreakdown, ShopTable
│   ├── videos/                      # Same pattern: types, hooks, components
│   ├── ads/
│   ├── creators/
│   ├── content/
│   ├── samples/
│   ├── scorecards/
│   ├── planning/
│   ├── calendar/
│   ├── workflow/
│   └── import/
│
├── data/                            # Data layer
│   ├── repositories/types.ts        # All repository interfaces
│   ├── adapters/mock/               # Mock implementations (one per module)
│   ├── fixtures/                    # JSON fixture data
│   └── index.ts                     # Factory: exports `repositories` object
│
├── stores/                          # Client-side state (Zustand)
│   ├── auth.store.ts                # User auth state (disabled for now)
│   └── app.store.ts                 # Sidebar toggle, date range
│
├── lib/
│   ├── utils.ts                     # cn(), formatCurrency, formatPercent, etc.
│   ├── export.ts                    # CSV export utility
│   └── csv-import/                  # CSV parsing, validation, column mapping
│
└── styles/
    └── globals.css                  # Tailwind theme tokens (dark mode)
```

## Tech Stack

| What | Why |
|---|---|
| **TanStack Start** | Full-stack React framework with SSR, file-based routing, server functions |
| **TanStack Router** | Type-safe routing — route params are validated at compile time |
| **TanStack Query** | Server state management — caching, loading states, refetching |
| **React 19** | UI library |
| **TypeScript** | Type safety end-to-end |
| **Tailwind CSS v4** | Utility-first styling with custom dark theme tokens |
| **Recharts** | Charts (area charts, bar charts) |
| **Zustand** | Client-side state (sidebar toggle, date range, auth) |
| **date-fns** | Date formatting and math |
| **Lucide React** | Icon library |
| **Papa Parse** | CSV parsing for the import wizard |
| **Vitest** | Test runner |

## Key Concepts

### Modules

Each feature area is a "module" in `src/modules/`. A module owns:
- **types.ts** — TypeScript interfaces for its data
- **hooks.ts** — TanStack Query hooks for fetching data
- **components/** — React components specific to this module

Modules never import from other modules (except `shared/`). This keeps them independent and easy to work on.

### Repository Pattern

Every data call goes through a repository interface. Example:

```typescript
// The interface (what the UI expects)
interface ShopRepository {
  getDailyMetrics(clientId: string, range: DateRange): Promise<ShopDailyMetric[]>
}

// The mock implementation (what runs now)
function createMockShopRepository(): ShopRepository {
  return {
    async getDailyMetrics(_clientId, range) {
      return shopFixtureData.filter(m => m.date >= range.from && m.date <= range.to)
    }
  }
}

// The future API implementation (swap in when backend is ready)
function createApiShopRepository(): ShopRepository {
  return {
    async getDailyMetrics(clientId, range) {
      const res = await fetch(`/api/shop/${clientId}/metrics?from=${range.from}&to=${range.to}`)
      return res.json()
    }
  }
}
```

To switch from mock to real data, change one line in `src/data/index.ts`.

### Mock Data

All fixture data is in `src/data/fixtures/`. The data is modeled after real HEYDUDE TikTok Shop data:
- 91 days of daily shop/video/ads metrics (Sep-Nov 2025)
- 25 creators with realistic GMV, CTR, GPM, commission rates
- 30 content submissions, 20 spark codes
- 30 products, 25 sample orders, 10 hero products
- 20 weekly scorecards, 12 monthly scorecards
- 4 quarterly OGSM plans with strategy levers
- 20 calendar events, 15 workflow tasks

### CSV Import

The Data Import page has a 5-step wizard:
1. **Select data type** — Shop, Video, Ads, Creators, Samples, or Content
2. **Upload CSV** — drag-and-drop or file picker
3. **Map columns** — match CSV columns to expected fields (auto-maps matching names)
4. **Preview & validate** — see first 10 rows, highlights errors
5. **Confirm** — review and import

This replaces the daily process of downloading CSVs from TikTok and pasting into Excel.

### CSV Export

Shop Analytics, Video Performance, and Ads Management pages have "Export CSV" buttons that download the current data as a CSV file.

## What's Next

### Connect to Real Backend

When your backend API is ready:

1. Create API adapters in `src/data/adapters/api/` (one per module)
2. Each adapter implements the same repository interface but calls your API instead of reading JSON
3. Update `src/data/index.ts` to use the API adapters
4. No UI changes needed

### Re-enable Authentication

Auth is built but disabled. To re-enable:

1. In `src/routes/$orgSlug/$clientSlug/route.tsx`, add back the `beforeLoad` auth guard
2. In `src/routes/index.tsx`, add back the auth check before redirect
3. The login page at `/login` is already built

### Add More Clients

The URL structure supports multiple clients out of the box:
- `/halo/heydude/shop` — HEYDUDE dashboard
- `/halo/brand-b/shop` — Brand B dashboard

Each client just needs its own data in the backend. The UI is the same.

### TikTok API Integration

When you connect to TikTok's API directly:
1. Add API adapters that call TikTok Seller Center endpoints
2. Set up background data sync (server functions or cron)
3. The CSV Import remains as a fallback for data not available via API

## Running Tests

```bash
npm run vitest          # Watch mode
npx vitest run          # Single run (48 tests)
```

Tests cover: utility functions, Zustand stores, repository adapters, and key UI components.
