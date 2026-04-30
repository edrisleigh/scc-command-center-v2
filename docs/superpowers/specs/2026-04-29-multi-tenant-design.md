# Multi-Tenant (Pre-Login) — Design Spec

**Date:** 2026-04-29
**Status:** Implemented (branch `feat/multi-tenant`, 2026-04-29)
**Author:** edrisa@halo.agency (with Claude)

---

## Summary

The app already has a multi-tenant URL scaffold (`/:orgSlug/:clientSlug/...`) and types for `Organization`, `Client`, and `User`, but the layers below the URL ignore tenant identity: mock adapters discard `clientId`, hooks hard-code `'client-1'`/`"HEYDUDE"`, the root path hard-codes a redirect to `halo/heydude`, the persistence layer uses a single un-scoped namespace, and the agency overview page returns a hand-stitched single-client result.

This spec turns that scaffold into real multi-tenancy at the data layer, mutation layer, and UI — without introducing real authentication. A "fake current user" stands in for login (with a dev-only switcher to swap users), so the architectural shape matches what real auth will eventually need: when login lands, the only thing that changes is how the current user is resolved.

## Why

The existing scaffold is a façade — clicking between `heydude` and `brand-b` shows identical data because no mock adapter actually filters by client. We can't demo cross-client behavior, can't catch tenant-leakage bugs in mutations, and can't validate that the agency overview, pickers, and scoping logic work. Login is a separate, larger workstream; we don't want it on the critical path for being able to *show* the product working as a multi-tenant SaaS.

## Scope

### In scope
- Add real tenant resolution to the route layout via `beforeLoad` (org + client lookup, 404 on unknown slug, redirect when fake user's org doesn't match URL).
- Upgrade `useTenant()` to return resolved entities (not just slugs); add a sibling `useOrgTenant()` for org-level pages.
- Add `clientId` (and `orgId` where relevant) to every fixture row; mock adapters filter by them.
- Hand-curate fixture data for ~4–5 clients across 2 orgs.
- Scoped persistence: three namespaces (global / org / client) in `persist.ts`, used by all mock mutations.
- Remove every hard-coded `'client-1'` / `"HEYDUDE"` reference; rewrite `useAgencyOverview` to fan out across the current org's clients.
- Topbar client switcher (real, scoped to current user's org).
- Topbar dev-only fake-user switcher (clears React Query cache + navigates to that user's home).
- Tests: per-adapter scoping smoke tests; one persistence-isolation test; manual click-through script.

### Out of scope
- Real authentication / login flow (auth store and `auth.mock.ts` exist; we reuse them but don't add real session logic).
- Org switcher control (org changes only via the dev fake-user switcher).
- "Create new client" / "create new org" UI flow.
- Per-user permission enforcement (the `role` field on `User` exists but isn't checked anywhere yet, and won't be in this spec).
- Migrating existing localStorage entries from the un-scoped namespace (orphaned, ignored).
- Backend / API adapter implementation (still mock-only).

## Tenant identity model

Three concepts, kept distinct:

- **Org** — an agency. Resolved from `:orgSlug`. Has many clients.
- **Client** — a brand inside an agency. Resolved from `:clientSlug`. Owns operational data (shop / video / ads / creators / content / samples / scorecards / workflow).
- **Fake user** — the stand-in for "who is logged in." Belongs to exactly one org. Determines which orgs/clients the picker offers and where invalid URLs redirect to.

Two scopes flow out of this:

- **Client scope** = `(orgId, clientId)` — every analytics/ops page; mutations on a client's data.
- **Org scope** = `orgId` — agency overview; org-level routes (`launch-scenarios`).

A third **global** scope covers anything tenant-independent (sidebar collapse, theme, persisted fake-user-id).

## Route loader & resolution

Resolution lives in two route layout files. Both already exist as thin pass-throughs.

### `/$orgSlug/route.tsx`

`beforeLoad`:

1. Read the current fake user from `auth.store` (fall back to a default `FAKE_USERS[0]` so the app boots without ceremony).
2. Look up the org by slug via `repositories.auth.getOrganizations()`.
3. If the slug doesn't exist → `notFound()`.
4. If the slug exists but isn't the fake user's org → `redirect()` to the user's own org's first client.
5. Return `{ org, currentUser }` on the route context.

### `/$orgSlug/$clientSlug/route.tsx`

`beforeLoad`:

1. Read `org` from parent context.
2. Look up the client by slug via `repositories.auth.getClients(org.id)`.
3. If the slug doesn't exist (or belongs to a different org) → `notFound()`.
4. Return `{ org, client, currentUser }` on the route context.

### Hooks

```ts
// inside the $orgSlug/$clientSlug subtree
function useTenant(): { org: Organization; client: Client; currentUser: User }

// inside the $orgSlug subtree (overview, launch-scenarios)
function useOrgTenant(): { org: Organization; currentUser: User }
```

Both read from route context (not `useParams`).

### Root redirect

`src/routes/index.tsx` stops being hard-coded to `halo/heydude`. It reads the fake user, picks their org's first client, and redirects there. Switching the fake user changes where the app lands.

### Invalid slugs

The existing `NotFound` component already wired into the client route renders for unknown `clientSlug`. The org route uses TanStack Router's `notFound()` similarly.

## Data layer & fixtures

### Fixture shape

Every domain fixture row gains `clientId` (and `orgId` where appropriate). Where rows are nested (e.g., scorecards with weekly entries), the parent gets the IDs.

| Fixture | Scope | New columns |
|---|---|---|
| `shop-daily.json` | client | `clientId` |
| `video-daily.json` | client | `clientId` |
| `ads-daily.json` | client | `clientId` |
| `creators.json` | client | `clientId` |
| `content.json` | client | `clientId` |
| `samples.json` | client | `clientId` |
| `scorecards.json` | client | `clientId` |
| `workflow.json` | client | `clientId` |
| `calendar.json` | client | `clientId` |
| `launch-scenarios.json` | org | `orgId` (already keyed by client when linked) |
| `organizations.json` | source of truth | unchanged shape |

`organizations.json` expands to:

- **Halo Agency** (`org-1`, slug `halo`) — existing. Clients: HEYDUDE (existing, `client-1`), 1–2 additional hand-curated clients.
- A second agency (e.g., `Beam Collective`, `org-2`, slug `beam`). Clients: 1–2 hand-curated.
- 2 fake users, one admin per org.

The HEYDUDE dataset stays untouched and gets `clientId: 'client-1'` retroactively. New clients get smaller, hand-written datasets that render meaningfully across every page (no empty states by default) but look visibly different from HEYDUDE in scale, channel mix, and creator composition.

### Mock adapters

Every mock adapter that takes `clientId` (today underscored as `_clientId`) filters its fixture by it. Repositories that take `orgId` similarly start filtering. Method signatures don't change — only bodies.

Audit list (every file in `src/data/adapters/mock/`):

- `shop.mock.ts`, `video.mock.ts`, `ads.mock.ts`, `creators.mock.ts`, `content.mock.ts`, `samples.mock.ts`, `scorecards.mock.ts`, `workflow.mock.ts`, `calendar.mock.ts` — all filter by `clientId`.
- `launch.mock.ts` — filter by `orgId`.
- `freshness.mock.ts`, `flags.mock.ts` — audit at implementation time; if they hold per-client state, scope them.
- `auth.mock.ts` — already correctly returns clients filtered by `orgId`.

### Hard-coded id removal

- `useAgencyOverview` rewritten: takes `org` from `useOrgTenant()`, calls `repositories.auth.getClients(org.id)`, fans out one query per client with `useQueries`. Returned shape becomes an array of per-client summaries; the overview page renders them generically.
- A grep audit removes every `'client-1'` and `"HEYDUDE"` literal from `src/`.

### Fixture generator

`src/data/fixtures/generate-fixtures.ts` is updated to emit tenant ids alongside existing data. HEYDUDE rows tagged `client-1` retroactively; new clients added with their own seeds.

## Persistence scoping

Three namespaces, matching the three identity scopes:

```
scc-mock:global:<key>                       → sidebar, theme, fake-user-id
scc-mock:org:<orgId>:<key>                  → launch scenarios, agency-wide state
scc-mock:client:<orgId>:<clientId>:<key>    → workflow, content edits, mutations on client data
```

`orgId` is included in client keys as belt-and-suspenders against cross-org `clientId` collisions.

### `persist.ts` API

```ts
type Scope =
  | { kind: 'global' }
  | { kind: 'org'; orgId: string }
  | { kind: 'client'; orgId: string; clientId: string }

function readPersisted<T>(scope: Scope, key: string): T | null
function writePersisted<T>(scope: Scope, key: string, value: T): void
function createScopedStore<T>(scope: Scope, key: string, seed: () => T): {
  read: () => T
  write: (next: T) => void
}
```

### Adapter usage

Each mock adapter holds a small `Map<string, Store>` keyed by serialized scope, lazily instantiating a `createScopedStore` the first time a given `(orgId, clientId)` combo is touched. Avoids both module-level singletons and per-call re-seeding.

### Old keys

Existing un-scoped `scc-mock:<key>` entries become orphans and are ignored. No migration logic. Devs can `localStorage.clear()` if they care.

### React Query cache

A side effect of removing hard-coded `'client-1'`: every `queryKey` will now include the actual `clientId` (and `orgId` for org-level pages). Switching tenants in the UI yields different cache entries — no stale-data flicker, no manual `invalidateQueries()` plumbing on switch.

**Audit substep:** mutation hooks today perform optimistic cache updates with hard-coded keys. Those keys must gain `orgId` / `clientId` too, otherwise post-mutation cache writes go to the wrong bucket. A grep over `useMutation`/`setQueryData`/`invalidateQueries` calls is part of the implementation.

## UI — switchers and dev affordances

### Client switcher (real, user-facing)

In the topbar where the current client name shows. A dropdown listing every client in the current user's org. Selecting one navigates to `/$orgSlug/<newClientSlug>/<currentPage>` — preserving the page (shop / videos / ads / …). If the destination page doesn't exist for that client (it shouldn't ever, but as a guardrail), fall back to `/shop`. The org name shows next to it as a static label, not a control.

### Fake-user switcher (dev-only)

Hidden behind a debug menu in the topbar (small wrench icon). Opens a popover listing the fake users from `organizations.json`. Selecting one:

1. Writes the new fake user to `auth.store` (persisted at `global` scope as `fake-user-id`).
2. Calls `queryClient.clear()` to drop the previous tenant's cache.
3. Navigates to that user's org's first client.

Rendered unconditionally for now (since "without login" is the explicit context). When real auth lands, gate behind `import.meta.env.DEV` or remove.

### Agency overview

`/$orgSlug/overview` becomes dynamic. `useAgencyOverview` reads `org` from `useOrgTenant()`, lists that org's clients, fans out one query per client with `useQueries`, returns an array. The page renders that array generically — no `clients[0]` assumption.

### Explicitly not building

- No org switcher control.
- No "create new client" or "create new org" flow.
- No per-user permission UI; both fake users are admins.

## Testing

Three layers of confidence:

1. **Per-adapter scoping smoke test.** One Vitest case per mock repository: given a fixture with rows for two clients, `getX(clientA, ...)` returns only clientA rows. Locks in the filter contract.
2. **Persistence isolation test.** Single test: write at `client(org-1, client-1)`, read at `client(org-1, client-2)` and `client(org-2, *)` — assert no leakage. Same for org scope.
3. **Manual smoke pass (documented, not automated).**
   - Land on `/` → arrive at fake-user-1's org's first client.
   - Use client switcher → URL updates, data changes, page preserved.
   - Open dev menu → switch fake user → cache clears, navigates to user-2's org's first client.
   - Save a workflow change → switch back to user-1 → change is gone.
   - Visit `/halo/nonexistent/shop` → 404.
   - As user-1, visit `/beam/...` → redirected to `halo/<first-client>/shop`.

## Rollout sequence

Each step keeps the app green and shippable. Ordering matters: fixture data for new tenants must arrive *after* adapter filtering, otherwise existing-tenant pages would briefly merge data across all rows in the fixture.

1. **Fixture column tagging + persistence scoping + adapter filtering.** Land together because they're coupled. Add `clientId`/`orgId` columns to every existing row (all tagged `client-1` / `org-1` initially). Add the scoped `persist.ts` API. Switch each mock adapter to filter by ids and to use scoped persistence. App behavior unchanged because the only existing client is `client-1`.
2. **Expand fixtures with new orgs/clients.** Add the second agency and additional clients to `organizations.json`; hand-curate per-domain fixture data for each. Visiting their slugs directly (`/halo/<new-client>/...`, `/beam/...`) now shows their own data, distinct from HEYDUDE.
3. **Route loaders + tenant resolution.** Add `beforeLoad` to org and client route layouts; rewrite `useTenant`, add `useOrgTenant`. Replace hard-coded redirect at `/` with fake-user-driven redirect. 404s on unknown slugs become real.
4. **Hook cleanup.** Remove every hard-coded `'client-1'` / `"HEYDUDE"`. Route real `clientId` through. Update `useAgencyOverview` for fan-out and update the overview page to render the array. Audit optimistic-update query keys.
5. **UI switchers.** Topbar client switcher; dev-only fake-user switcher (clears React Query cache, navigates).
6. **Tests + smoke pass.**

Step 1 is invisible. Step 2 makes new tenants visible *if you type their URL*. Step 3 makes invalid URLs fail loudly. Step 5 is where it *feels* like multi-tenant.

## Risks

- **Hard-coded query keys in mutations.** Optimistic updates that don't include `clientId`/`orgId` write to the wrong cache bucket after step 4. Mitigated by the explicit grep audit substep in step 4.
- **Old localStorage entries.** Pre-refactor users have un-scoped `scc-mock:*` keys. They become orphans. Acceptable for dev/mock; user-visible effect is "my old saved workflow is gone" — fine.
- **Calendar scope assumption.** Spec treats calendar as client-scoped (matches existing route file). If domain model says agency-wide, route file moves and fixture re-keys to `orgId`. Catch at fixture-curation time.
- **Auth-store coupling.** The fake-user switcher writes to `auth.store`. When real auth lands, that store gets repurposed; the dev switcher must be removed or gated behind `import.meta.env.DEV`. Risk is forgetting — explicit reminder lives here and in code comments around the switcher.
- **`useAgencyOverview` rewrite breaks the existing overview page.** Today the page assumes one client; after step 4 it gets an array. Mitigated by updating the page in the same step (called out as a substep, not a separate concern).

## Hand-off

When this spec is approved, the writing-plans skill produces a step-by-step implementation plan against this spec's rollout sequence.
