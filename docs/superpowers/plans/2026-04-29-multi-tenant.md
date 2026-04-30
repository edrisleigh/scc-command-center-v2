# Multi-Tenant (Pre-Login) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the existing multi-tenant URL scaffold into actually-working multi-tenancy at the data, mutation, and UI layers — with a fake-user stand-in for login that mimics the eventual auth shape.

**Architecture:** Tenant identity is resolved in TanStack Router `beforeLoad` hooks at `/$orgSlug` and `/$orgSlug/$clientSlug`, then read by hooks via route context. Mock adapters scope all data and persistence by `(orgId, clientId)`. A topbar client switcher and a dev-only fake-user switcher provide tenant navigation.

**Tech Stack:** TanStack Router/Query, React 19, Zustand, Tailwind v4, Vitest, TypeScript.

**Spec:** `docs/superpowers/specs/2026-04-29-multi-tenant-design.md`

**Tenant model used by this plan:**

| orgId  | orgSlug | name             | clientId  | clientSlug | clientName       | fakeUser |
|--------|---------|------------------|-----------|------------|------------------|----------|
| org-1  | halo    | Halo Agency      | client-1  | heydude    | HEYDUDE          | user-1   |
| org-1  | halo    | Halo Agency      | client-2  | apex       | Apex Outdoors    | —        |
| org-2  | beam    | Beam Collective  | client-3  | nova       | Nova Skincare    | user-2   |
| org-2  | beam    | Beam Collective  | client-4  | pulse      | Pulse Audio      | —        |

Fake users: `user-1` (Edris Aleigh, admin, org-1, existing) and `user-2` (Jordan Taylor, admin, org-2, new).

---

## File map

**New files:**
- `src/data/adapters/mock/persist.test.ts` — persistence isolation test
- `src/data/adapters/mock/__tests__/scoping.test.ts` — per-adapter filter smoke tests
- `src/modules/shared/components/client-switcher.tsx` — topbar client picker
- `src/modules/shared/components/fake-user-switcher.tsx` — dev-only debug picker
- `src/modules/shared/hooks/use-org-tenant.ts` — org-only context reader

**Modified files:**
- `src/data/adapters/mock/persist.ts` — adds scoped API
- `src/data/adapters/mock/{shop,video,ads,creators,content,samples,scorecards,workflow,calendar,flags,freshness,launch}.mock.ts` — filter by ids; use scoped persistence
- `src/data/fixtures/{shop-daily,video-daily,ads-daily,creators,content,samples,scorecards,workflow,calendar,launch-scenarios,organizations}.json` — add `clientId`/`orgId`; expand with new tenants
- `src/data/fixtures/generate-fixtures.ts` — emit `clientId` on rows
- `src/routes/index.tsx` — fake-user-driven redirect
- `src/routes/$orgSlug/route.tsx` — `beforeLoad` resolves org
- `src/routes/$orgSlug/$clientSlug/route.tsx` — `beforeLoad` resolves client
- `src/modules/shared/hooks/use-tenant.ts` — read from route context
- `src/modules/shared/hooks/use-current-user.ts` — fall back to user-1 from fixtures
- `src/modules/shared/hooks/use-agency-overview.ts` — fan out across the org's clients
- `src/modules/shared/components/agency-overview-page.tsx` — render array
- `src/modules/shared/components/topbar.tsx` — embed switchers
- `src/modules/shared/components/sidebar.tsx` — drop hard-coded `'client-1'`
- `src/modules/shared/components/settings-page.tsx` — render real org/client names
- `src/modules/shared/components/login-page.tsx` — drop hard-coded redirect
- `src/modules/{shop,videos,ads,creators,content,samples,scorecards,workflow,calendar,flags,freshness,import}/components/*.tsx` — drop hard-coded `'client-1'`, use `useTenant()`
- `src/routes/$orgSlug/$clientSlug/{shop,videos,ads,creators,content,samples,scorecards,workflow,calendar,flags}.tsx` — drop hard-coded `'client-1'` in route loaders

**File responsibility:**
- `persist.ts` — only thing in the codebase that knows how localStorage keys are namespaced
- `use-tenant.ts` / `use-org-tenant.ts` — only readers of tenant identity downstream of route loaders
- `client-switcher.tsx` / `fake-user-switcher.tsx` — only producers of tenant navigation events

---

## Phase 1 — Persistence scoping foundation

Phase goal: Replace the un-scoped `persist.ts` API with one that namespaces by tenant. No adapter changes yet — adapters keep working because we leave the old API in place (deprecated) until they migrate in Phase 2.

### Task 1.1: Add scoped persistence API

**Files:**
- Modify: `src/data/adapters/mock/persist.ts`
- Test: `src/data/adapters/mock/persist.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/data/adapters/mock/persist.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { readPersisted, writePersisted, createScopedStore } from './persist'

beforeEach(() => {
  if (typeof window !== 'undefined') window.localStorage.clear()
})

describe('persist scoping', () => {
  it('client scope isolates data across clients in the same org', () => {
    writePersisted({ kind: 'client', orgId: 'org-1', clientId: 'client-1' }, 'k', 'a')
    writePersisted({ kind: 'client', orgId: 'org-1', clientId: 'client-2' }, 'k', 'b')

    expect(readPersisted({ kind: 'client', orgId: 'org-1', clientId: 'client-1' }, 'k')).toBe('a')
    expect(readPersisted({ kind: 'client', orgId: 'org-1', clientId: 'client-2' }, 'k')).toBe('b')
  })

  it('client scope isolates data across orgs', () => {
    writePersisted({ kind: 'client', orgId: 'org-1', clientId: 'client-1' }, 'k', 'a')
    writePersisted({ kind: 'client', orgId: 'org-2', clientId: 'client-1' }, 'k', 'b')

    expect(readPersisted({ kind: 'client', orgId: 'org-1', clientId: 'client-1' }, 'k')).toBe('a')
    expect(readPersisted({ kind: 'client', orgId: 'org-2', clientId: 'client-1' }, 'k')).toBe('b')
  })

  it('org scope isolates data across orgs', () => {
    writePersisted({ kind: 'org', orgId: 'org-1' }, 'k', 'a')
    writePersisted({ kind: 'org', orgId: 'org-2' }, 'k', 'b')

    expect(readPersisted({ kind: 'org', orgId: 'org-1' }, 'k')).toBe('a')
    expect(readPersisted({ kind: 'org', orgId: 'org-2' }, 'k')).toBe('b')
  })

  it('global scope is shared', () => {
    writePersisted({ kind: 'global' }, 'k', 'a')
    expect(readPersisted({ kind: 'global' }, 'k')).toBe('a')
  })

  it('createScopedStore seeds on first read and persists on write', () => {
    const seedFn = () => ({ count: 0 })
    const store = createScopedStore(
      { kind: 'client', orgId: 'org-1', clientId: 'client-1' },
      'counter',
      seedFn,
    )

    expect(store.read()).toEqual({ count: 0 })
    store.write({ count: 5 })
    expect(store.read()).toEqual({ count: 5 })

    const fresh = createScopedStore(
      { kind: 'client', orgId: 'org-1', clientId: 'client-1' },
      'counter',
      seedFn,
    )
    expect(fresh.read()).toEqual({ count: 5 })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/data/adapters/mock/persist.test.ts`
Expected: FAIL — `readPersisted` and `writePersisted` signatures don't match (today they take `(key)`, not `(scope, key)`).

- [ ] **Step 3: Replace `persist.ts` body**

Overwrite `src/data/adapters/mock/persist.ts` with:

```ts
const NAMESPACE = 'scc-mock:'

export type Scope =
  | { kind: 'global' }
  | { kind: 'org'; orgId: string }
  | { kind: 'client'; orgId: string; clientId: string }

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function scopePrefix(scope: Scope): string {
  switch (scope.kind) {
    case 'global':
      return 'global:'
    case 'org':
      return `org:${scope.orgId}:`
    case 'client':
      return `client:${scope.orgId}:${scope.clientId}:`
  }
}

function fullKey(scope: Scope, key: string): string {
  return `${NAMESPACE}${scopePrefix(scope)}${key}`
}

export function readPersisted<T>(scope: Scope, key: string): T | null {
  if (!isBrowser()) return null
  try {
    const raw = window.localStorage.getItem(fullKey(scope, key))
    if (raw === null) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function writePersisted<T>(scope: Scope, key: string, value: T): void {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(fullKey(scope, key), JSON.stringify(value))
  } catch {
    // swallow quota/serialization errors — mock only
  }
}

export function createScopedStore<T>(
  scope: Scope,
  key: string,
  seed: () => T,
): { read: () => T; write: (next: T) => void } {
  let cache: T | null = null

  function load(): T {
    if (cache !== null) return cache
    const persisted = readPersisted<T>(scope, key)
    if (persisted !== null) {
      cache = persisted
      return persisted
    }
    const seeded = seed()
    cache = seeded
    writePersisted(scope, key, seeded)
    return seeded
  }

  function save(next: T): void {
    cache = next
    writePersisted(scope, key, next)
  }

  return { read: load, write: save }
}

export function generateId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8)
  return `${prefix}-${Date.now().toString(36)}-${rand}`
}
```

This breaks the existing un-scoped `createPersistedStore` export. We will fix all callers in subsequent tasks before re-running the dev server.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/data/adapters/mock/persist.test.ts`
Expected: PASS — all 5 tests green.

- [ ] **Step 5: Note: build is currently broken**

`npm run build` will fail because `workflow.mock.ts`, `calendar.mock.ts`, `flags.mock.ts`, `freshness.mock.ts` still import the removed `createPersistedStore`. This is fixed in Tasks 1.2–1.5. Do not commit until Phase 1 is complete and the build is green.

### Task 1.2: Migrate workflow.mock.ts to scoped persistence

**Files:**
- Modify: `src/data/adapters/mock/workflow.mock.ts`

- [ ] **Step 1: Replace the file body**

Overwrite `src/data/adapters/mock/workflow.mock.ts`:

```ts
import type { WorkflowRepository } from '@/data/repositories/types'
import workflowData from '@/data/fixtures/workflow.json'
import type { WorkflowTask, WorkflowTaskInput } from '@/modules/workflow/types'
import { createScopedStore, generateId, type Scope } from './persist'

type Store = ReturnType<typeof createScopedStore<WorkflowTask[]>>

const stores = new Map<string, Store>()

function getStore(orgId: string, clientId: string): Store {
  const key = `${orgId}:${clientId}`
  let store = stores.get(key)
  if (!store) {
    const scope: Scope = { kind: 'client', orgId, clientId }
    store = createScopedStore<WorkflowTask[]>(scope, 'workflow.tasks', () =>
      (workflowData.tasks as WorkflowTask[])
        .filter((t) => (t as WorkflowTask & { clientId?: string }).clientId === clientId)
        .map((t) => ({
          ...t,
          createdAt: t.createdAt ?? new Date('2026-01-01').toISOString(),
        })),
    )
    stores.set(key, store)
  }
  return store
}

function ridOrgId(_clientId: string): string {
  return 'org-1' // temporary: until WorkflowRepository receives orgId in Phase 4
}

export function createMockWorkflowRepository(): WorkflowRepository {
  return {
    async getWorkflowTasks(clientId: string): Promise<WorkflowTask[]> {
      return getStore(ridOrgId(clientId), clientId).read()
    },
    async createTask(
      clientId: string,
      input: WorkflowTaskInput,
      actor: string,
    ): Promise<WorkflowTask> {
      const store = getStore(ridOrgId(clientId), clientId)
      const now = new Date().toISOString()
      const next: WorkflowTask = {
        ...input,
        id: generateId('wf'),
        completedThisWeek: [false, false, false, false, false],
        createdAt: now,
        updatedAt: now,
        updatedBy: actor,
      }
      store.write([...store.read(), next])
      return next
    },
    async updateTask(
      clientId: string,
      id: string,
      patch: Partial<Omit<WorkflowTask, 'id' | 'createdAt'>>,
      actor: string,
    ): Promise<WorkflowTask> {
      const store = getStore(ridOrgId(clientId), clientId)
      const current = store.read()
      const idx = current.findIndex((t) => t.id === id)
      if (idx === -1) throw new Error(`Workflow task not found: ${id}`)
      const updated: WorkflowTask = {
        ...current[idx],
        ...patch,
        updatedAt: new Date().toISOString(),
        updatedBy: actor,
      }
      const next = [...current]
      next[idx] = updated
      store.write(next)
      return updated
    },
    async deleteTask(clientId: string, id: string): Promise<void> {
      const store = getStore(ridOrgId(clientId), clientId)
      store.write(store.read().filter((t) => t.id !== id))
    },
  }
}
```

The `ridOrgId` shim returns `'org-1'` because workflow data is currently HEYDUDE-only. Phase 4 replaces it with real `orgId` resolution once route loaders provide it. This keeps the persistence key shape correct from day one.

- [ ] **Step 2: Run typecheck**

Run: `npx tsc --noEmit`
Expected: workflow.mock.ts errors should be resolved (other adapters still error — that's fine).

### Task 1.3: Migrate calendar.mock.ts to scoped persistence

**Files:**
- Modify: `src/data/adapters/mock/calendar.mock.ts`

- [ ] **Step 1: Replace the file body**

Overwrite `src/data/adapters/mock/calendar.mock.ts`:

```ts
import type { CalendarRepository } from '@/data/repositories/types'
import calendarData from '@/data/fixtures/calendar.json'
import type { CalendarEvent, CalendarEventInput } from '@/modules/calendar/types'
import { createScopedStore, generateId, type Scope } from './persist'

type Store = ReturnType<typeof createScopedStore<CalendarEvent[]>>

const stores = new Map<string, Store>()

function getStore(orgId: string, clientId: string): Store {
  const key = `${orgId}:${clientId}`
  let store = stores.get(key)
  if (!store) {
    const scope: Scope = { kind: 'client', orgId, clientId }
    store = createScopedStore<CalendarEvent[]>(scope, 'calendar.events', () =>
      (calendarData.events as CalendarEvent[])
        .filter((e) => (e as CalendarEvent & { clientId?: string }).clientId === clientId)
        .map((e) => ({
          ...e,
          createdAt: e.createdAt ?? new Date('2026-01-01').toISOString(),
        })),
    )
    stores.set(key, store)
  }
  return store
}

function ridOrgId(_clientId: string): string {
  return 'org-1'
}

export function createMockCalendarRepository(): CalendarRepository {
  return {
    async getEvents(clientId: string): Promise<CalendarEvent[]> {
      return getStore(ridOrgId(clientId), clientId).read()
    },
    async createEvent(
      clientId: string,
      input: CalendarEventInput,
      actor: string,
    ): Promise<CalendarEvent> {
      const store = getStore(ridOrgId(clientId), clientId)
      const now = new Date().toISOString()
      const next: CalendarEvent = {
        ...input,
        id: generateId('cal'),
        createdAt: now,
        updatedAt: now,
        updatedBy: actor,
      }
      store.write([...store.read(), next])
      return next
    },
    async updateEvent(
      clientId: string,
      id: string,
      patch: Partial<CalendarEventInput>,
      actor: string,
    ): Promise<CalendarEvent> {
      const store = getStore(ridOrgId(clientId), clientId)
      const current = store.read()
      const idx = current.findIndex((e) => e.id === id)
      if (idx === -1) throw new Error(`Calendar event not found: ${id}`)
      const updated: CalendarEvent = {
        ...current[idx],
        ...patch,
        updatedAt: new Date().toISOString(),
        updatedBy: actor,
      }
      const next = [...current]
      next[idx] = updated
      store.write(next)
      return updated
    },
    async deleteEvent(clientId: string, id: string): Promise<void> {
      const store = getStore(ridOrgId(clientId), clientId)
      store.write(store.read().filter((e) => e.id !== id))
    },
  }
}
```

### Task 1.4: Migrate flags.mock.ts to scoped persistence

**Files:**
- Modify: `src/data/adapters/mock/flags.mock.ts`

Note: flags already filters by `clientId` internally via `f.clientId === clientId`. We're swapping the persistence store, not the filter logic.

- [ ] **Step 1: Replace the file body**

Overwrite `src/data/adapters/mock/flags.mock.ts`:

```ts
import type { FlagsRepository } from '@/data/repositories/types'
import type { Flag, FlagStatus } from '@/modules/flags/types'
import { createScopedStore, generateId, type Scope } from './persist'

type Store = ReturnType<typeof createScopedStore<Flag[]>>

const stores = new Map<string, Store>()

function getStore(orgId: string, clientId: string): Store {
  const key = `${orgId}:${clientId}`
  let store = stores.get(key)
  if (!store) {
    const scope: Scope = { kind: 'client', orgId, clientId }
    store = createScopedStore<Flag[]>(scope, 'flags.records', () => [])
    stores.set(key, store)
  }
  return store
}

function ridOrgId(_clientId: string): string {
  return 'org-1'
}

export function createMockFlagsRepository(): FlagsRepository {
  return {
    async getFlags(clientId) {
      return getStore(ridOrgId(clientId), clientId).read()
    },

    async createFlag(clientId, input, actor) {
      const store = getStore(ridOrgId(clientId), clientId)
      const now = new Date().toISOString()
      const flag: Flag = {
        id: generateId('flag'),
        clientId,
        section: input.section,
        dataPointRef: input.dataPointRef,
        description: input.description,
        priority: input.priority,
        status: 'open',
        createdAt: now,
        createdBy: actor,
        comments: [],
      }
      store.write([...store.read(), flag])
      return flag
    },

    async updateFlagStatus(clientId, id, status: FlagStatus, actor) {
      const store = getStore(ridOrgId(clientId), clientId)
      const all = store.read()
      const idx = all.findIndex((f) => f.id === id)
      if (idx < 0) throw new Error('Flag not found')
      const now = new Date().toISOString()
      const prev = all[idx]
      const next: Flag = {
        ...prev,
        status,
        assignee: status === 'in_progress' && !prev.assignee ? actor : prev.assignee,
        resolvedAt: status === 'resolved' ? now : undefined,
      }
      const copy = [...all]
      copy[idx] = next
      store.write(copy)
      return next
    },

    async assignFlag(clientId, id, assignee) {
      const store = getStore(ridOrgId(clientId), clientId)
      const all = store.read()
      const idx = all.findIndex((f) => f.id === id)
      if (idx < 0) throw new Error('Flag not found')
      const next: Flag = { ...all[idx], assignee }
      const copy = [...all]
      copy[idx] = next
      store.write(copy)
      return next
    },

    async addComment(clientId, id, body, actor) {
      const store = getStore(ridOrgId(clientId), clientId)
      const all = store.read()
      const idx = all.findIndex((f) => f.id === id)
      if (idx < 0) throw new Error('Flag not found')
      const next: Flag = {
        ...all[idx],
        comments: [
          ...all[idx].comments,
          {
            id: generateId('c'),
            author: actor,
            body,
            createdAt: new Date().toISOString(),
          },
        ],
      }
      const copy = [...all]
      copy[idx] = next
      store.write(copy)
      return next
    },

    async deleteFlag(clientId, id) {
      const store = getStore(ridOrgId(clientId), clientId)
      const all = store.read()
      store.write(all.filter((f) => f.id !== id))
    },
  }
}
```

The internal `&& f.clientId === clientId` redundancy from the old version is removed — the store itself is now per-client.

### Task 1.5: Migrate freshness.mock.ts to scoped persistence

**Files:**
- Modify: `src/data/adapters/mock/freshness.mock.ts`

- [ ] **Step 1: Replace the file body**

Overwrite `src/data/adapters/mock/freshness.mock.ts`:

```ts
import type { FreshnessRepository } from '@/data/repositories/types'
import type { FreshnessRecord, DataSource } from '@/modules/freshness/types'
import { createScopedStore, type Scope } from './persist'

type Store = ReturnType<typeof createScopedStore<FreshnessRecord[]>>

const stores = new Map<string, Store>()

function getStore(orgId: string, clientId: string): Store {
  const key = `${orgId}:${clientId}`
  let store = stores.get(key)
  if (!store) {
    const scope: Scope = { kind: 'client', orgId, clientId }
    store = createScopedStore<FreshnessRecord[]>(scope, 'freshness.records', () => [])
    stores.set(key, store)
  }
  return store
}

function ridOrgId(_clientId: string): string {
  return 'org-1'
}

export function createMockFreshnessRepository(): FreshnessRepository {
  return {
    async getFreshness(clientId: string): Promise<FreshnessRecord[]> {
      return getStore(ridOrgId(clientId), clientId).read()
    },
    async recordRefresh(
      clientId: string,
      dataSource: DataSource,
      actor: string,
    ): Promise<FreshnessRecord> {
      const store = getStore(ridOrgId(clientId), clientId)
      const now = new Date().toISOString()
      const record: FreshnessRecord = {
        clientId,
        dataSource,
        updatedAt: now,
        updatedBy: actor,
      }
      const current = store.read()
      const filtered = current.filter((r) => r.dataSource !== dataSource)
      store.write([...filtered, record])
      return record
    },
  }
}
```

- [ ] **Step 2: Verify build is green**

Run: `npx tsc --noEmit && npm run build`
Expected: PASS — all four migrated adapters compile and the bundle builds.

- [ ] **Step 3: Commit Phase 1**

```bash
git add src/data/adapters/mock/persist.ts src/data/adapters/mock/persist.test.ts \
  src/data/adapters/mock/workflow.mock.ts src/data/adapters/mock/calendar.mock.ts \
  src/data/adapters/mock/flags.mock.ts src/data/adapters/mock/freshness.mock.ts
git commit -m "feat(mock): scoped persistence (global/org/client namespaces)

Adds Scope type and scoped read/write/createScopedStore APIs.
Migrates workflow, calendar, flags, freshness adapters to use
per-(orgId, clientId) stores. Stub orgId='org-1' until route
loaders supply it in Phase 4."
```

---

## Phase 2 — Adapter filtering + fixture column tagging

Phase goal: Add `clientId` to every existing fixture row (all tagged with the existing tenant) and make every adapter filter by it. App behavior unchanged because there's still only one client (`client-1` for everything).

### Task 2.1: Tag shop-daily.json + filter shop.mock.ts

**Files:**
- Modify: `src/data/fixtures/shop-daily.json`
- Modify: `src/data/adapters/mock/shop.mock.ts`
- Test: `src/data/adapters/mock/__tests__/scoping.test.ts`

- [ ] **Step 1: Tag every fixture row with `"clientId": "client-1"`**

The fixture is a flat JSON array of ~91 daily metric rows. Run a one-off script to add the field:

```bash
node -e '
const fs = require("fs");
const path = "src/data/fixtures/shop-daily.json";
const data = JSON.parse(fs.readFileSync(path, "utf8"));
const tagged = data.map(r => ({ clientId: "client-1", ...r }));
fs.writeFileSync(path, JSON.stringify(tagged, null, 2) + "\n");
console.log("Tagged", tagged.length, "rows");
'
```

Expected: `Tagged 91 rows`

- [ ] **Step 2: Add `clientId` to ShopDailyMetric type**

Open `src/modules/shop/types.ts`. Find the `ShopDailyMetric` interface and add `clientId: string` as the first field. Example before:

```ts
export interface ShopDailyMetric {
  date: string
  gmv: number
  // ...
}
```

After:

```ts
export interface ShopDailyMetric {
  clientId: string
  date: string
  gmv: number
  // ...
}
```

- [ ] **Step 3: Write the failing scoping test**

Create `src/data/adapters/mock/__tests__/scoping.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import { createMockShopRepository } from '../shop.mock'

const range = { from: new Date('2025-01-01'), to: new Date('2026-12-31') }

describe('shop adapter tenant scoping', () => {
  it('returns only rows for the requested clientId', async () => {
    const repo = createMockShopRepository()
    const heydude = await repo.getDailyMetrics('client-1', range)
    const unknown = await repo.getDailyMetrics('client-999', range)

    expect(heydude.length).toBeGreaterThan(0)
    expect(heydude.every((r) => r.clientId === 'client-1')).toBe(true)
    expect(unknown).toEqual([])
  })
})
```

Run: `npx vitest run src/data/adapters/mock/__tests__/scoping.test.ts`
Expected: FAIL — `unknown` returns rows because shop.mock.ts ignores `clientId`.

- [ ] **Step 4: Make shop.mock.ts filter by clientId**

Replace the body of `src/data/adapters/mock/shop.mock.ts`:

```ts
import type { ShopRepository } from '@/data/repositories/types'
import type { DateRange } from '@/modules/shared/types'
import shopData from '@/data/fixtures/shop-daily.json'
import type { ShopDailyMetric } from '@/modules/shop/types'

export function createMockShopRepository(): ShopRepository {
  return {
    async getDailyMetrics(clientId: string, range: DateRange): Promise<ShopDailyMetric[]> {
      const from = range.from.toISOString().split('T')[0]
      const to = range.to.toISOString().split('T')[0]
      return (shopData as ShopDailyMetric[]).filter(
        (m) => m.clientId === clientId && m.date >= from && m.date <= to,
      )
    },
  }
}
```

- [ ] **Step 5: Re-run test**

Run: `npx vitest run src/data/adapters/mock/__tests__/scoping.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/data/fixtures/shop-daily.json src/modules/shop/types.ts \
  src/data/adapters/mock/shop.mock.ts src/data/adapters/mock/__tests__/scoping.test.ts
git commit -m "feat(shop): scope mock adapter by clientId"
```

### Task 2.2: Tag video-daily.json + filter video.mock.ts

**Files:**
- Modify: `src/data/fixtures/video-daily.json`
- Modify: `src/modules/videos/types.ts` (add `clientId` to `VideoDailyMetric`)
- Modify: `src/data/adapters/mock/video.mock.ts`
- Modify: `src/data/adapters/mock/__tests__/scoping.test.ts`

- [ ] **Step 1: Tag fixture rows**

```bash
node -e '
const fs = require("fs");
const path = "src/data/fixtures/video-daily.json";
const data = JSON.parse(fs.readFileSync(path, "utf8"));
const tagged = data.map(r => ({ clientId: "client-1", ...r }));
fs.writeFileSync(path, JSON.stringify(tagged, null, 2) + "\n");
'
```

- [ ] **Step 2: Add `clientId: string` to `VideoDailyMetric`**

In `src/modules/videos/types.ts`, add `clientId: string` as the first field of `VideoDailyMetric`.

- [ ] **Step 3: Add the failing test**

Append to `src/data/adapters/mock/__tests__/scoping.test.ts`:

```ts
import { createMockVideoRepository } from '../video.mock'

describe('video adapter tenant scoping', () => {
  it('returns only rows for the requested clientId', async () => {
    const repo = createMockVideoRepository()
    const heydude = await repo.getDailyMetrics('client-1', range)
    const unknown = await repo.getDailyMetrics('client-999', range)

    expect(heydude.length).toBeGreaterThan(0)
    expect(heydude.every((r) => r.clientId === 'client-1')).toBe(true)
    expect(unknown).toEqual([])
  })
})
```

Run: `npx vitest run src/data/adapters/mock/__tests__/scoping.test.ts -t video`
Expected: FAIL.

- [ ] **Step 4: Filter in video.mock.ts**

Replace the body of `src/data/adapters/mock/video.mock.ts`:

```ts
import type { VideoRepository } from '@/data/repositories/types'
import type { DateRange } from '@/modules/shared/types'
import videoData from '@/data/fixtures/video-daily.json'
import type { VideoDailyMetric } from '@/modules/videos/types'

export function createMockVideoRepository(): VideoRepository {
  return {
    async getDailyMetrics(clientId: string, range: DateRange): Promise<VideoDailyMetric[]> {
      const from = range.from.toISOString().split('T')[0]
      const to = range.to.toISOString().split('T')[0]
      return (videoData as VideoDailyMetric[]).filter(
        (m) => m.clientId === clientId && m.date >= from && m.date <= to,
      )
    },
  }
}
```

- [ ] **Step 5: Re-run test → PASS, commit**

```bash
git add src/data/fixtures/video-daily.json src/modules/videos/types.ts \
  src/data/adapters/mock/video.mock.ts src/data/adapters/mock/__tests__/scoping.test.ts
git commit -m "feat(videos): scope mock adapter by clientId"
```

### Task 2.3: Tag ads-daily.json + filter ads.mock.ts

Same pattern as Task 2.2.

- [ ] **Step 1: Tag rows** (same node script, swap path to `ads-daily.json`)
- [ ] **Step 2: Add `clientId: string` to `AdsDailyMetric` in `src/modules/ads/types.ts`**
- [ ] **Step 3: Add a failing test for ads adapter**

```ts
import { createMockAdsRepository } from '../ads.mock'

describe('ads adapter tenant scoping', () => {
  it('returns only rows for the requested clientId', async () => {
    const repo = createMockAdsRepository()
    const heydude = await repo.getDailyMetrics('client-1', range)
    const unknown = await repo.getDailyMetrics('client-999', range)
    expect(heydude.length).toBeGreaterThan(0)
    expect(heydude.every((r) => r.clientId === 'client-1')).toBe(true)
    expect(unknown).toEqual([])
  })
})
```

- [ ] **Step 4: Filter in ads.mock.ts**

```ts
return (adsData as AdsDailyMetric[]).filter(
  (m) => m.clientId === clientId && m.date >= from && m.date <= to,
)
```

- [ ] **Step 5: Run test → PASS, commit**

```bash
git add src/data/fixtures/ads-daily.json src/modules/ads/types.ts \
  src/data/adapters/mock/ads.mock.ts src/data/adapters/mock/__tests__/scoping.test.ts
git commit -m "feat(ads): scope mock adapter by clientId"
```

### Task 2.4: Tag creators.json + filter creators.mock.ts

The creators fixture has multiple arrays inside (`creators`, `liveCreators`, `targetCollabs`, `collaborationData`, `creatorIncentives`). All need tagging.

**Files:**
- Modify: `src/data/fixtures/creators.json`
- Modify: `src/modules/creators/types.ts` (add `clientId` to all five interfaces)
- Modify: `src/data/adapters/mock/creators.mock.ts`
- Modify: `src/data/adapters/mock/__tests__/scoping.test.ts`

- [ ] **Step 1: Tag every row in every array**

```bash
node -e '
const fs = require("fs");
const path = "src/data/fixtures/creators.json";
const data = JSON.parse(fs.readFileSync(path, "utf8"));
for (const k of Object.keys(data)) {
  if (Array.isArray(data[k])) {
    data[k] = data[k].map(r => ({ clientId: "client-1", ...r }));
  }
}
fs.writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
'
```

- [ ] **Step 2: Add `clientId: string` to `Creator`, `LiveCreator`, `TargetCollab`, `CollaborationData`, `CreatorIncentive` in `src/modules/creators/types.ts`**

- [ ] **Step 3: Add failing test**

```ts
import { createMockCreatorRepository } from '../creators.mock'

describe('creators adapter tenant scoping', () => {
  it('returns only creators/live/collabs/etc. for the requested clientId', async () => {
    const repo = createMockCreatorRepository()

    expect((await repo.getCreators('client-1')).length).toBeGreaterThan(0)
    expect(await repo.getCreators('client-999')).toEqual([])
    expect(await repo.getLiveCreators('client-999')).toEqual([])
    expect(await repo.getTargetCollabs('client-999')).toEqual([])
    expect(await repo.getCollaborationData('client-999')).toEqual([])
    expect(await repo.getCreatorIncentives('client-999')).toEqual([])
  })
})
```

- [ ] **Step 4: Filter in creators.mock.ts**

Replace the body:

```ts
import type { CreatorRepository } from '@/data/repositories/types'
import creatorsData from '@/data/fixtures/creators.json'
import type {
  Creator,
  LiveCreator,
  TargetCollab,
  CollaborationData,
  CreatorIncentive,
} from '@/modules/creators/types'

export function createMockCreatorRepository(): CreatorRepository {
  return {
    async getCreators(clientId: string): Promise<Creator[]> {
      return (creatorsData.creators as Creator[]).filter((c) => c.clientId === clientId)
    },
    async getCreatorById(clientId: string, creatorId: string): Promise<Creator | null> {
      return (
        (creatorsData.creators as Creator[]).find(
          (c) => c.id === creatorId && c.clientId === clientId,
        ) ?? null
      )
    },
    async getLiveCreators(clientId: string): Promise<LiveCreator[]> {
      return (creatorsData.liveCreators as LiveCreator[]).filter(
        (c) => c.clientId === clientId,
      )
    },
    async getTargetCollabs(clientId: string): Promise<TargetCollab[]> {
      return (creatorsData.targetCollabs as TargetCollab[]).filter(
        (c) => c.clientId === clientId,
      )
    },
    async getCollaborationData(clientId: string): Promise<CollaborationData[]> {
      return (creatorsData.collaborationData as CollaborationData[]).filter(
        (c) => c.clientId === clientId,
      )
    },
    async getCreatorIncentives(clientId: string): Promise<CreatorIncentive[]> {
      return (creatorsData.creatorIncentives as CreatorIncentive[]).filter(
        (c) => c.clientId === clientId,
      )
    },
  }
}
```

- [ ] **Step 5: Run test → PASS, commit**

```bash
git add src/data/fixtures/creators.json src/modules/creators/types.ts \
  src/data/adapters/mock/creators.mock.ts src/data/adapters/mock/__tests__/scoping.test.ts
git commit -m "feat(creators): scope mock adapter by clientId"
```

### Task 2.5: Tag content.json + filter content.mock.ts

Same pattern. Two arrays inside the fixture: `contentSubmissions` and `sparkCodes`.

- [ ] **Step 1: Tag rows** (use the multi-array node script from Task 2.4 with the content path)
- [ ] **Step 2: Add `clientId: string` to `ContentSubmission` and `SparkCode` in `src/modules/content/types.ts`**
- [ ] **Step 3: Add failing test**

```ts
import { createMockContentRepository } from '../content.mock'

describe('content adapter tenant scoping', () => {
  it('returns only submissions/spark codes for the requested clientId', async () => {
    const repo = createMockContentRepository()
    expect((await repo.getContentSubmissions('client-1')).length).toBeGreaterThan(0)
    expect(await repo.getContentSubmissions('client-999')).toEqual([])
    expect(await repo.getSparkCodes('client-999')).toEqual([])
  })
})
```

- [ ] **Step 4: Filter in content.mock.ts**

```ts
async getContentSubmissions(clientId: string): Promise<ContentSubmission[]> {
  return (contentData.contentSubmissions as ContentSubmission[]).filter(
    (c) => c.clientId === clientId,
  )
},
async getSparkCodes(clientId: string): Promise<SparkCode[]> {
  return (contentData.sparkCodes as SparkCode[]).filter((c) => c.clientId === clientId)
},
```

- [ ] **Step 5: Run test → PASS, commit**

### Task 2.6: Tag samples.json + filter samples.mock.ts

Four arrays: `products`, `sampleOrders`, `heroProducts`, `restocks`.

- [ ] **Step 1: Tag rows** (multi-array script, samples.json)
- [ ] **Step 2: Add `clientId: string` to `Product`, `SampleOrder`, `HeroProduct`, `Restock` in `src/modules/samples/types.ts`**
- [ ] **Step 3: Failing test**

```ts
import { createMockSamplesRepository } from '../samples.mock'

describe('samples adapter tenant scoping', () => {
  it('filters every getter by clientId', async () => {
    const repo = createMockSamplesRepository()
    expect((await repo.getProducts('client-1')).length).toBeGreaterThan(0)
    expect(await repo.getProducts('client-999')).toEqual([])
    expect(await repo.getSampleOrders('client-999')).toEqual([])
    expect(await repo.getHeroProducts('client-999')).toEqual([])
    expect(await repo.getRestocks('client-999')).toEqual([])
  })
})
```

- [ ] **Step 4: Filter all four getters in samples.mock.ts**

Pattern: `samplesData.products.filter((p) => p.clientId === clientId)` for each.

- [ ] **Step 5: Run test → PASS, commit**

### Task 2.7: Tag scorecards.json + filter scorecards.mock.ts

Two arrays: `weekly`, `monthly`.

- [ ] **Step 1: Tag rows** (multi-array script, scorecards.json)
- [ ] **Step 2: Add `clientId: string` to `WeeklyScorecard` and `MonthlyScorecard` in `src/modules/scorecards/types.ts`**
- [ ] **Step 3: Failing test**

```ts
import { createMockScorecardsRepository } from '../scorecards.mock'

describe('scorecards adapter tenant scoping', () => {
  it('filters weekly and monthly by clientId', async () => {
    const repo = createMockScorecardsRepository()
    expect((await repo.getWeeklyScorecard('client-1')).length).toBeGreaterThan(0)
    expect(await repo.getWeeklyScorecard('client-999')).toEqual([])
    expect(await repo.getMonthlyScorecard('client-999')).toEqual([])
  })
})
```

- [ ] **Step 4: Filter in scorecards.mock.ts**

```ts
async getWeeklyScorecard(clientId: string): Promise<WeeklyScorecard[]> {
  return (scorecardsData.weekly as WeeklyScorecard[]).filter((s) => s.clientId === clientId)
},
async getMonthlyScorecard(clientId: string): Promise<MonthlyScorecard[]> {
  return (scorecardsData.monthly as MonthlyScorecard[]).filter((s) => s.clientId === clientId)
},
```

- [ ] **Step 5: Run test → PASS, commit**

### Task 2.8: Tag workflow.json + verify workflow.mock.ts filters

workflow.mock.ts already filters during seed (Task 1.2 anticipated this). We just need to tag the fixture so the seed actually returns rows.

- [ ] **Step 1: Tag tasks**

The fixture has `tasks` array (and possibly other top-level keys). Run:

```bash
node -e '
const fs = require("fs");
const path = "src/data/fixtures/workflow.json";
const data = JSON.parse(fs.readFileSync(path, "utf8"));
data.tasks = data.tasks.map(r => ({ clientId: "client-1", ...r }));
fs.writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
'
```

- [ ] **Step 2: Add `clientId: string` to `WorkflowTask` in `src/modules/workflow/types.ts`**

- [ ] **Step 3: Failing test**

```ts
import { createMockWorkflowRepository } from '../workflow.mock'

describe('workflow adapter tenant scoping', () => {
  it('seeds only tasks matching the clientId', async () => {
    if (typeof window !== 'undefined') window.localStorage.clear()
    const repo = createMockWorkflowRepository()
    expect((await repo.getWorkflowTasks('client-1')).length).toBeGreaterThan(0)
    expect(await repo.getWorkflowTasks('client-999')).toEqual([])
  })
})
```

- [ ] **Step 4: Already implemented in 1.2 — test should pass now that fixture rows are tagged**

Run: `npx vitest run src/data/adapters/mock/__tests__/scoping.test.ts -t workflow`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/fixtures/workflow.json src/modules/workflow/types.ts \
  src/data/adapters/mock/__tests__/scoping.test.ts
git commit -m "feat(workflow): tag fixture rows with clientId"
```

### Task 2.9: Tag calendar.json + verify calendar.mock.ts filters

Same as 2.8 — calendar.mock.ts was prepared in 1.3.

- [ ] **Step 1: Tag events**

```bash
node -e '
const fs = require("fs");
const path = "src/data/fixtures/calendar.json";
const data = JSON.parse(fs.readFileSync(path, "utf8"));
data.events = data.events.map(r => ({ clientId: "client-1", ...r }));
fs.writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
'
```

- [ ] **Step 2: Add `clientId: string` to `CalendarEvent` in `src/modules/calendar/types.ts`**

- [ ] **Step 3: Failing test**

```ts
import { createMockCalendarRepository } from '../calendar.mock'

describe('calendar adapter tenant scoping', () => {
  it('seeds only events matching the clientId', async () => {
    if (typeof window !== 'undefined') window.localStorage.clear()
    const repo = createMockCalendarRepository()
    expect((await repo.getEvents('client-1')).length).toBeGreaterThan(0)
    expect(await repo.getEvents('client-999')).toEqual([])
  })
})
```

- [ ] **Step 4: Run test → PASS** (already filters in 1.3)
- [ ] **Step 5: Commit**

```bash
git add src/data/fixtures/calendar.json src/modules/calendar/types.ts \
  src/data/adapters/mock/__tests__/scoping.test.ts
git commit -m "feat(calendar): tag fixture rows with clientId"
```

### Task 2.10: Tag launch-scenarios.json with `orgId` (no adapter change)

The `LaunchRepository` interface already filters by `orgSlug` (which uniquely identifies an org). Per the spec exception, we keep slug-based filtering and only add `orgId` to fixture rows for shape consistency. No adapter or test change.

- [ ] **Step 1: Add `orgId` to the existing fixture row**

Edit `src/data/fixtures/launch-scenarios.json`. The existing entry has `"orgSlug": "halo"` — add `"orgId": "org-1"` next to it. Resulting top of file:

```json
[
  {
    "id": "ls-heydude-q2-2026",
    "orgId": "org-1",
    "orgSlug": "halo",
    "clientSlug": "heydude",
    ...
  }
]
```

- [ ] **Step 2: Add optional `orgId` to `LaunchScenario` in `src/modules/launch/types.ts`**

```ts
export interface LaunchScenario {
  id: string
  orgId: string
  orgSlug: string
  // ...
}
```

- [ ] **Step 3: Update `launch.mock.ts` `create` to set `orgId`**

In the `create` method, add `orgId: 'org-1'` (or look it up from the orgs fixture). Simplest concrete fix — add an inline lookup:

```ts
import organizationsData from '@/data/fixtures/organizations.json'

// inside create():
const org = organizationsData.organizations.find((o) => o.slug === orgSlug)
const orgId = org?.id ?? 'org-1'
const created: LaunchScenario = {
  id,
  orgId,
  orgSlug,
  // rest unchanged
  ...
}
```

- [ ] **Step 4: Run typecheck**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/data/fixtures/launch-scenarios.json src/modules/launch/types.ts \
  src/data/adapters/mock/launch.mock.ts
git commit -m "feat(launch): add orgId to fixture and Scenario type for shape consistency"
```

### Task 2.11: Verify Phase 2 — full suite + smoke check

- [ ] **Step 1: Run full test suite**

Run: `npm test`
Expected: PASS — all per-adapter scoping tests + persistence isolation green.

- [ ] **Step 2: Run dev server smoke check**

```bash
npm run dev
```

Open http://localhost:5174 — every page (shop / videos / ads / creators / content / samples / scorecards / workflow / calendar) should render exactly the same data as before. There is still only one tagged client.

- [ ] **Step 3: Update fixture generator**

In `src/data/fixtures/generate-fixtures.ts`, update each fixture-emit block to add `clientId: 'client-1'` to the generated rows. For shop:

```ts
const shopDaily: ShopDailyMetric[] = dates.map((date) => {
  // ... existing calculation ...
  return {
    clientId: 'client-1',
    date,
    gmv,
    // ... rest unchanged
  }
})
```

Apply the same pattern to `videoDaily` and `adsDaily` blocks. (The generator only handles the three time-series fixtures; the others are hand-curated already.)

Run: `npx tsx src/data/fixtures/generate-fixtures.ts && npm test`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/data/fixtures/generate-fixtures.ts \
  src/data/fixtures/shop-daily.json src/data/fixtures/video-daily.json src/data/fixtures/ads-daily.json
git commit -m "feat(fixtures): generator emits clientId on time-series rows"
```

---

## Phase 3 — Expand fixtures with new orgs/clients

Phase goal: Add a second org and three new clients with hand-curated, internally consistent data. After this phase, visiting the new slugs *directly* (no UI yet) shows distinct data.

### Task 3.1: Expand organizations.json

**Files:**
- Modify: `src/data/fixtures/organizations.json`

- [ ] **Step 1: Replace file contents**

Overwrite `src/data/fixtures/organizations.json`:

```json
{
  "organizations": [
    { "id": "org-1", "name": "Halo Agency", "slug": "halo" },
    { "id": "org-2", "name": "Beam Collective", "slug": "beam" }
  ],
  "clients": [
    { "id": "client-1", "organizationId": "org-1", "name": "HEYDUDE", "slug": "heydude", "platform": "tiktok" },
    { "id": "client-2", "organizationId": "org-1", "name": "Apex Outdoors", "slug": "apex", "platform": "tiktok" },
    { "id": "client-3", "organizationId": "org-2", "name": "Nova Skincare", "slug": "nova", "platform": "tiktok" },
    { "id": "client-4", "organizationId": "org-2", "name": "Pulse Audio", "slug": "pulse", "platform": "tiktok" }
  ],
  "users": [
    { "id": "user-1", "name": "Edris Aleigh", "email": "edris@halo.com", "role": "admin", "organizationId": "org-1" },
    { "id": "user-2", "name": "Jordan Taylor", "email": "jordan@beam.com", "role": "admin", "organizationId": "org-2" }
  ]
}
```

Note the renames: the previous `client-2` was `Brand B / brand-b`. We're repurposing the id but changing slug+name to `apex / Apex Outdoors`. No code references `'brand-b'` outside the static `BRAND_B_MOCK` in `agency-overview-page.tsx`, which Phase 5 deletes.

- [ ] **Step 2: Update `auth.mock.ts` to read from the fixture**

Replace `src/data/adapters/mock/auth.mock.ts`:

```ts
import type { AuthRepository } from '@/data/repositories/types'
import type { Organization, Client, User } from '@/modules/shared/types'
import data from '@/data/fixtures/organizations.json'

const organizations = data.organizations as Organization[]
const clients = data.clients as Client[]
const users = data.users as User[]

export function createMockAuthRepository(): AuthRepository {
  return {
    async login(email: string, _password: string) {
      const user = users.find((u) => u.email === email)
      if (!user) {
        return {
          user: {
            id: 'user-demo',
            name: 'Demo User',
            email,
            role: 'member' as const,
            organizationId: 'org-1',
          },
          token: 'mock-jwt-token',
        }
      }
      return { user, token: 'mock-jwt-token' }
    },
    async getOrganizations() {
      return organizations
    },
    async getClients(orgId: string) {
      return clients.filter((c) => c.organizationId === orgId)
    },
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add src/data/fixtures/organizations.json src/data/adapters/mock/auth.mock.ts
git commit -m "feat(tenants): add Beam Collective + 3 new clients + 2nd fake user"
```

### Task 3.2: Curate Apex Outdoors (client-2) fixture data

Apex is a smaller, footwear-adjacent brand on TikTok Shop. Target: roughly 60% the scale of HEYDUDE, with a heavier LIVE channel mix and fewer creators.

**Files:**
- Modify: every fixture file

- [ ] **Step 1: Append shop-daily rows for client-2**

Generate 91 days of shop metrics for client-2. Run this script (it appends to the existing file):

```bash
node -e '
const fs = require("fs");
const path = "src/data/fixtures/shop-daily.json";
const data = JSON.parse(fs.readFileSync(path, "utf8"));

let seed = 99;
const rand = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff };
const between = (a, b) => a + rand() * (b - a);
const round = (n, d=2) => Math.round(n * 10**d) / 10**d;

const dates = [];
const cur = new Date("2025-09-01");
const end = new Date("2025-11-30");
while (cur <= end) { dates.push(cur.toISOString().split("T")[0]); cur.setDate(cur.getDate()+1); }

const apex = dates.map(date => {
  const dow = new Date(date).getDay();
  const weekend = dow === 0 || dow === 6 ? 1.2 : 1.0;
  const gmv = round(between(80000, 130000) * weekend);
  const orders = Math.round(between(450, 950) * weekend);
  const visitors = Math.round(between(11000, 26000) * weekend);
  const liveGmvPct = between(0.40, 0.55);
  const videoGmvPct = between(0.18, 0.28);
  const productCardGmvPct = between(0.12, 0.22);
  const total = liveGmvPct + videoGmvPct + productCardGmvPct;
  return {
    clientId: "client-2",
    date,
    gmv,
    grossRevenue: round(gmv * between(1.05, 1.13)),
    itemsSold: Math.round(orders * between(1.05, 1.20)),
    customers: Math.round(orders * between(0.85, 0.97)),
    visitors,
    pageViews: Math.round(visitors * between(2.4, 4.0)),
    skuOrders: Math.round(orders * between(1.1, 1.3)),
    orders,
    conversionRate: round((orders / visitors) * 100, 2),
    liveGmv: round(gmv * (liveGmvPct/total)),
    videoGmv: round(gmv * (videoGmvPct/total)),
    productCardGmv: round(gmv * (productCardGmvPct/total)),
  };
});

fs.writeFileSync(path, JSON.stringify([...data, ...apex], null, 2) + "\n");
console.log("Appended", apex.length, "client-2 rows");
'
```

- [ ] **Step 2: Append video-daily rows for client-2**

```bash
node -e '
const fs = require("fs");
const path = "src/data/fixtures/video-daily.json";
const data = JSON.parse(fs.readFileSync(path, "utf8"));

let seed = 101;
const rand = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff };
const between = (a, b) => a + rand() * (b - a);
const round = (n, d=2) => Math.round(n*10**d)/10**d;

const dates = [];
const cur = new Date("2025-09-01"); const end = new Date("2025-11-30");
while (cur <= end) { dates.push(cur.toISOString().split("T")[0]); cur.setDate(cur.getDate()+1); }

const apex = dates.map(date => {
  const views = Math.round(between(180000, 420000));
  const ctr = round(between(2.4, 4.0), 2);
  const clicks = Math.round(views * ctr / 100);
  const orders = Math.round(clicks * between(0.04, 0.07));
  const gmv = round(orders * between(70, 120));
  return {
    clientId: "client-2",
    date,
    videoGmv: gmv,
    videoViews: views,
    videoClicks: clicks,
    videoOrders: orders,
    ctr,
    clickToOrderRate: round((orders/clicks)*100, 2),
    gpm: round(gmv/views*1000, 2),
  };
});

fs.writeFileSync(path, JSON.stringify([...data, ...apex], null, 2) + "\n");
'
```

(If `VideoDailyMetric` has more fields, mirror them — open the type and adjust before running.)

- [ ] **Step 3: Append ads-daily rows for client-2**

```bash
node -e '
const fs = require("fs");
const path = "src/data/fixtures/ads-daily.json";
const data = JSON.parse(fs.readFileSync(path, "utf8"));

let seed = 113;
const rand = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff };
const between = (a, b) => a + rand() * (b - a);
const round = (n, d=2) => Math.round(n*10**d)/10**d;

const dates = [];
const cur = new Date("2025-09-01"); const end = new Date("2025-11-30");
while (cur <= end) { dates.push(cur.toISOString().split("T")[0]); cur.setDate(cur.getDate()+1); }

const apex = dates.map(date => {
  const adSpend = round(between(8000, 16000));
  const roas = round(between(2.4, 4.5), 2);
  const adGmv = round(adSpend * roas);
  return {
    clientId: "client-2",
    date,
    adSpend,
    roas,
    adGmv,
    adOrders: Math.round(adGmv / between(70, 120)),
    targetCollabs: Math.round(between(2, 6)),
    openCollabs: Math.round(between(8, 18)),
    commissionPaid: round(adGmv * between(0.10, 0.15)),
  };
});

fs.writeFileSync(path, JSON.stringify([...data, ...apex], null, 2) + "\n");
'
```

(Mirror `AdsDailyMetric`'s actual fields.)

- [ ] **Step 4: Append creators for client-2 (small set: 8 creators, 4 live, 6 collabs)**

Open `src/data/fixtures/creators.json` and add hand-written entries to each array. For `creators`, append eight objects of the shape:

```json
{
  "clientId": "client-2",
  "id": "cr-apex-001",
  "handle": "@trail_jess",
  "name": "Jessica Lin",
  "tier": "VIP",
  "p28dAffiliateGmv": 4280.50,
  "p28dVideos": 3,
  "p28dGpm": 18.5,
  "ctr": 3.1,
  "commissionRate": 0.12
}
```

(Repeat with varied handles, names, and metrics for 8 entries; check the existing HEYDUDE entries for the exact shape of `Creator` and use the same fields.)

For `liveCreators` (4 entries), `targetCollabs` (6), `collaborationData` (6), `creatorIncentives` (3) — append client-2-tagged entries following the existing shape. Keep the data internally consistent (creator ids referenced in collabs/incentives match creator ids in the creators array).

- [ ] **Step 5: Append content for client-2 (8 submissions, 5 spark codes)**

Open `src/data/fixtures/content.json`. Append 8 `clientId: 'client-2'` entries to `contentSubmissions` and 5 to `sparkCodes`, following the existing field shapes.

- [ ] **Step 6: Append samples for client-2 (8 products, 6 sample orders, 3 hero, 2 restocks)**

Open `src/data/fixtures/samples.json`. Append per-array entries with `clientId: 'client-2'`. Product names should fit a "footwear/outdoor accessories" theme to make Apex visually distinct from HEYDUDE.

- [ ] **Step 7: Append scorecards for client-2 (6 weekly, 3 monthly)**

Open `src/data/fixtures/scorecards.json`. Append `clientId: 'client-2'` entries to both `weekly` and `monthly`. Scale GMV/orders to ~60% of HEYDUDE's values.

- [ ] **Step 8: Append workflow tasks for client-2 (4 tasks)**

Open `src/data/fixtures/workflow.json`. Append 4 `clientId: 'client-2'` task entries to `data.tasks`.

- [ ] **Step 9: Append calendar events for client-2 (5 events)**

Open `src/data/fixtures/calendar.json`. Append 5 `clientId: 'client-2'` events to `data.events`.

- [ ] **Step 10: Run tests + dev smoke**

```bash
npm test
npm run dev
```

Visit http://localhost:5174/halo/apex/shop directly — should render Apex's data. (Topbar will still say `apex` since we haven't built the switcher yet.) HEYDUDE pages should be unchanged.

- [ ] **Step 11: Commit**

```bash
git add src/data/fixtures
git commit -m "feat(fixtures): curate Apex Outdoors (client-2) data across all domains"
```

### Task 3.3: Curate Nova Skincare (client-3) fixture data

Nova is a Beam Collective skincare brand. Target: ~40% the scale of HEYDUDE, video-heavy channel mix, beauty-creator profiles.

- [ ] **Step 1: Append shop-daily rows for client-3**

```bash
node -e '
const fs = require("fs");
const path = "src/data/fixtures/shop-daily.json";
const data = JSON.parse(fs.readFileSync(path, "utf8"));

let seed = 137;
const rand = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff };
const between = (a, b) => a + rand() * (b - a);
const round = (n, d=2) => Math.round(n * 10**d) / 10**d;

const dates = [];
const cur = new Date("2025-09-01"); const end = new Date("2025-11-30");
while (cur <= end) { dates.push(cur.toISOString().split("T")[0]); cur.setDate(cur.getDate()+1); }

const nova = dates.map(date => {
  const dow = new Date(date).getDay();
  const weekend = dow === 0 || dow === 6 ? 1.15 : 1.0;
  const gmv = round(between(60000, 95000) * weekend);
  const orders = Math.round(between(380, 720) * weekend);
  const visitors = Math.round(between(8000, 19000) * weekend);
  // Video-heavy channel mix
  const videoGmvPct = between(0.45, 0.60);
  const liveGmvPct = between(0.18, 0.28);
  const productCardGmvPct = between(0.10, 0.20);
  const total = videoGmvPct + liveGmvPct + productCardGmvPct;
  return {
    clientId: "client-3",
    date,
    gmv,
    grossRevenue: round(gmv * between(1.05, 1.13)),
    itemsSold: Math.round(orders * between(1.05, 1.20)),
    customers: Math.round(orders * between(0.85, 0.97)),
    visitors,
    pageViews: Math.round(visitors * between(2.4, 4.0)),
    skuOrders: Math.round(orders * between(1.1, 1.3)),
    orders,
    conversionRate: round((orders / visitors) * 100, 2),
    liveGmv: round(gmv * (liveGmvPct/total)),
    videoGmv: round(gmv * (videoGmvPct/total)),
    productCardGmv: round(gmv * (productCardGmvPct/total)),
  };
});

fs.writeFileSync(path, JSON.stringify([...data, ...nova], null, 2) + "\n");
console.log("Appended", nova.length, "client-3 rows");
'
```

- [ ] **Step 2: Append video-daily rows for client-3**

Use the script template from Task 3.2 Step 2 with these changes: `seed = 149`, `clientId: "client-3"`, view range `220000–500000` (Nova relies on Video — higher view counts), CTR range `2.8–4.2`.

- [ ] **Step 3: Append ads-daily rows for client-3**

Use the script template from Task 3.2 Step 3 with these changes: `seed = 163`, `clientId: "client-3"`, ad spend range `5000–10000` (lower than Apex), ROAS range `2.0–3.8`.

- [ ] **Step 4: Append creators for client-3**

Open `src/data/fixtures/creators.json` and append to each array with `"clientId": "client-3"`:
- `creators` — 6 entries with skincare-themed handles (e.g. `@glow_with_amy`, `@dewy_dani`, `@spf_savannah`).
- `liveCreators` — 2 entries.
- `targetCollabs` — 4 entries.
- `collaborationData` — 4 entries (creator ids must reference creators above).
- `creatorIncentives` — 2 entries.

Match the field shape of the existing HEYDUDE entries.

- [ ] **Step 5: Append content for client-3**

Open `src/data/fixtures/content.json`. Append `clientId: 'client-3'` entries: 6 to `contentSubmissions`, 4 to `sparkCodes`.

- [ ] **Step 6: Append samples for client-3**

Open `src/data/fixtures/samples.json`. Append `clientId: 'client-3'` entries with skincare product names (serums, moisturizers, cleansers): 6 `products`, 4 `sampleOrders`, 2 `heroProducts`, 1 `restocks`.

- [ ] **Step 7: Append scorecards for client-3**

Open `src/data/fixtures/scorecards.json`. Append `clientId: 'client-3'` entries: 4 to `weekly`, 2 to `monthly`. Scale GMV/orders to ~40% of HEYDUDE.

- [ ] **Step 8: Append workflow tasks for client-3**

Open `src/data/fixtures/workflow.json`. Append 3 `clientId: 'client-3'` entries to `data.tasks`.

- [ ] **Step 9: Append calendar events for client-3**

Open `src/data/fixtures/calendar.json`. Append 4 `clientId: 'client-3'` entries to `data.events`.

- [ ] **Step 10: Smoke check**

```bash
npm test
npm run dev
```

Visit `/beam/nova/shop` directly — renders Nova data with video-heavy channel split.

- [ ] **Step 11: Commit**

```bash
git add src/data/fixtures
git commit -m "feat(fixtures): curate Nova Skincare (client-3) data across all domains"
```

### Task 3.4: Curate Pulse Audio (client-4) fixture data

Pulse is a Beam Collective audio/electronics brand. Target: ~50% scale, balanced channel mix, higher AOV.

- [ ] **Step 1: Append shop-daily rows for client-4**

```bash
node -e '
const fs = require("fs");
const path = "src/data/fixtures/shop-daily.json";
const data = JSON.parse(fs.readFileSync(path, "utf8"));

let seed = 179;
const rand = () => { seed = (seed * 1664525 + 1013904223) & 0xffffffff; return (seed >>> 0) / 0xffffffff };
const between = (a, b) => a + rand() * (b - a);
const round = (n, d=2) => Math.round(n * 10**d) / 10**d;

const dates = [];
const cur = new Date("2025-09-01"); const end = new Date("2025-11-30");
while (cur <= end) { dates.push(cur.toISOString().split("T")[0]); cur.setDate(cur.getDate()+1); }

const pulse = dates.map(date => {
  const dow = new Date(date).getDay();
  const weekend = dow === 0 || dow === 6 ? 1.18 : 1.0;
  const gmv = round(between(70000, 110000) * weekend);
  const orders = Math.round(between(280, 520) * weekend); // higher AOV → fewer orders
  const visitors = Math.round(between(9000, 22000) * weekend);
  // Balanced 33/33/33
  const liveGmvPct = between(0.30, 0.38);
  const videoGmvPct = between(0.30, 0.38);
  const productCardGmvPct = between(0.25, 0.35);
  const total = liveGmvPct + videoGmvPct + productCardGmvPct;
  return {
    clientId: "client-4",
    date,
    gmv,
    grossRevenue: round(gmv * between(1.05, 1.13)),
    itemsSold: Math.round(orders * between(1.0, 1.15)),
    customers: Math.round(orders * between(0.88, 0.98)),
    visitors,
    pageViews: Math.round(visitors * between(2.4, 4.0)),
    skuOrders: Math.round(orders * between(1.05, 1.2)),
    orders,
    conversionRate: round((orders / visitors) * 100, 2),
    liveGmv: round(gmv * (liveGmvPct/total)),
    videoGmv: round(gmv * (videoGmvPct/total)),
    productCardGmv: round(gmv * (productCardGmvPct/total)),
  };
});

fs.writeFileSync(path, JSON.stringify([...data, ...pulse], null, 2) + "\n");
console.log("Appended", pulse.length, "client-4 rows");
'
```

- [ ] **Step 2: Append video-daily rows for client-4**

Use the script template from Task 3.2 Step 2 with these changes: `seed = 191`, `clientId: "client-4"`, view range `200000–460000`, CTR range `2.6–3.8`.

- [ ] **Step 3: Append ads-daily rows for client-4**

Use the script template from Task 3.2 Step 3 with these changes: `seed = 211`, `clientId: "client-4"`, ad spend range `7000–14000`, ROAS range `2.8–4.8`.

- [ ] **Step 4: Append creators for client-4**

Open `src/data/fixtures/creators.json` and append with `"clientId": "client-4"`:
- `creators` — 7 entries with tech/audio-themed handles (e.g. `@beats_and_bass`, `@audio_aiden`, `@studio_sam`).
- `liveCreators` — 3 entries.
- `targetCollabs` — 5 entries.
- `collaborationData` — 5 entries (creator ids referencing creators above).
- `creatorIncentives` — 2 entries.

- [ ] **Step 5: Append content for client-4**

Open `src/data/fixtures/content.json`. Append `clientId: 'client-4'` entries: 7 to `contentSubmissions`, 4 to `sparkCodes`.

- [ ] **Step 6: Append samples for client-4**

Open `src/data/fixtures/samples.json`. Append `clientId: 'client-4'` entries with audio product names (earbuds, headphones, speakers): 7 `products`, 5 `sampleOrders`, 2 `heroProducts`, 2 `restocks`.

- [ ] **Step 7: Append scorecards for client-4**

Open `src/data/fixtures/scorecards.json`. Append `clientId: 'client-4'` entries: 5 to `weekly`, 2 to `monthly`. Scale GMV/orders to ~50% of HEYDUDE.

- [ ] **Step 8: Append workflow tasks for client-4**

Open `src/data/fixtures/workflow.json`. Append 4 `clientId: 'client-4'` entries to `data.tasks`.

- [ ] **Step 9: Append calendar events for client-4**

Open `src/data/fixtures/calendar.json`. Append 5 `clientId: 'client-4'` entries to `data.events`.

- [ ] **Step 10: Smoke check**

```bash
npm test
npm run dev
```

Visit `/beam/pulse/shop` directly — renders Pulse data with balanced channel split.

- [ ] **Step 11: Commit**

```bash
git add src/data/fixtures
git commit -m "feat(fixtures): curate Pulse Audio (client-4) data across all domains"
```

---

## Phase 4 — Route loaders + tenant resolution

Phase goal: Resolve org and client in `beforeLoad`; expose them via `useTenant()` / `useOrgTenant()`; remove the hard-coded root redirect.

### Task 4.1: Add `FAKE_USERS` constant + extend auth.store

**Files:**
- Modify: `src/stores/auth.store.ts`
- Create: `src/lib/fake-users.ts`

- [ ] **Step 1: Create `src/lib/fake-users.ts`**

```ts
import organizationsData from '@/data/fixtures/organizations.json'
import type { User } from '@/modules/shared/types'

export const FAKE_USERS: User[] = organizationsData.users as User[]

export function getFakeUserById(id: string): User | null {
  return FAKE_USERS.find((u) => u.id === id) ?? null
}

export const DEFAULT_FAKE_USER: User = FAKE_USERS[0]
```

- [ ] **Step 2: Update `src/stores/auth.store.ts`**

The store already exists. Make sure it can hydrate from fake users. Replace the file:

```ts
import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User } from '@/modules/shared/types'
import { DEFAULT_FAKE_USER, getFakeUserById } from '@/lib/fake-users'

interface AuthState {
  user: User
  isAuthenticated: boolean
  setFakeUser: (userId: string) => void
  logout: () => void
}

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: DEFAULT_FAKE_USER,
      isAuthenticated: true,
      setFakeUser: (userId) => {
        const next = getFakeUserById(userId) ?? DEFAULT_FAKE_USER
        set({ user: next, isAuthenticated: true })
      },
      logout: () => set({ user: DEFAULT_FAKE_USER, isAuthenticated: true }),
    }),
    {
      name: 'scc-auth',
      partialize: (s) => ({ userId: s.user.id }),
      merge: (persisted, current) => {
        const p = (persisted as { userId?: string }) ?? {}
        const restored = p.userId ? getFakeUserById(p.userId) : null
        return { ...current, user: restored ?? current.user }
      },
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : noopStorage,
      ),
    },
  ),
)
```

Key changes from the previous version: `user` is no longer nullable, `login(user)` is replaced by `setFakeUser(userId)`, and persistence stores only the user id (rehydrated through `getFakeUserById`).

- [ ] **Step 3: Update `use-current-user.ts`**

Replace `src/modules/shared/hooks/use-current-user.ts`:

```ts
import { useAuthStore } from '@/stores/auth.store'
import type { User } from '@/modules/shared/types'

export function useCurrentUser(): User {
  return useAuthStore((s) => s.user)
}
```

- [ ] **Step 4: Run typecheck**

Run: `npx tsc --noEmit`
Expected: errors in any file calling `useAuthStore().login(user)` — there's at least `login-page.tsx`. Phase 5 will rewrite that file. For now, change `login(user)` to `setFakeUser(user.id)` if that's the only fix needed; otherwise stub the call so the build passes.

- [ ] **Step 5: Commit**

```bash
git add src/lib/fake-users.ts src/stores/auth.store.ts \
  src/modules/shared/hooks/use-current-user.ts \
  src/modules/shared/components/login-page.tsx
git commit -m "feat(auth): fake-user store driven by organizations fixture"
```

### Task 4.2: Add `beforeLoad` to /$orgSlug/route.tsx

**Files:**
- Modify: `src/routes/$orgSlug/route.tsx`

- [ ] **Step 1: Replace the file**

Overwrite `src/routes/$orgSlug/route.tsx`:

```tsx
import { createFileRoute, notFound, redirect, Outlet } from '@tanstack/react-router'
import { repositories } from '@/data'
import { useAuthStore } from '@/stores/auth.store'
import { DEFAULT_FAKE_USER } from '@/lib/fake-users'
import type { Organization, User } from '@/modules/shared/types'

export const Route = createFileRoute('/$orgSlug')({
  beforeLoad: async ({ params }) => {
    const currentUser: User = useAuthStore.getState().user ?? DEFAULT_FAKE_USER
    const orgs = await repositories.auth.getOrganizations()
    const org = orgs.find((o) => o.slug === params.orgSlug)
    if (!org) throw notFound()

    if (org.id !== currentUser.organizationId) {
      const myOrg = orgs.find((o) => o.id === currentUser.organizationId)
      if (!myOrg) throw notFound()
      const myClients = await repositories.auth.getClients(myOrg.id)
      const firstClient = myClients[0]
      if (!firstClient) throw notFound()
      throw redirect({
        to: '/$orgSlug/$clientSlug/shop',
        params: { orgSlug: myOrg.slug, clientSlug: firstClient.slug },
      })
    }

    return { org, currentUser } satisfies { org: Organization; currentUser: User }
  },
  component: () => <Outlet />,
})
```

`useAuthStore.getState()` reads the store outside React — required because `beforeLoad` runs before any component renders.

- [ ] **Step 2: Run dev server**

```bash
npm run dev
```

Visit http://localhost:5174/halo/heydude/shop — works as before. Visit http://localhost:5174/nonexistent/heydude/shop — TanStack Router 404 page (or `notFound` from the org route).

- [ ] **Step 3: Commit**

```bash
git add src/routes/$orgSlug/route.tsx
git commit -m "feat(routes): resolve org in beforeLoad; redirect cross-org URLs"
```

### Task 4.3: Add `beforeLoad` to /$orgSlug/$clientSlug/route.tsx

**Files:**
- Modify: `src/routes/$orgSlug/$clientSlug/route.tsx`

- [ ] **Step 1: Replace the file**

Overwrite `src/routes/$orgSlug/$clientSlug/route.tsx`:

```tsx
import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { ClientShell } from '@/modules/shared/components/client-shell'
import { repositories } from '@/data'
import type { Client, Organization, User } from '@/modules/shared/types'

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h2 className="text-2xl font-bold text-foreground">Page not found</h2>
      <p className="mt-2 text-sm text-muted">The page you're looking for doesn't exist.</p>
      <Link to="/" className="mt-4 text-sm font-medium text-primary hover:underline">
        Go home
      </Link>
    </div>
  )
}

export const Route = createFileRoute('/$orgSlug/$clientSlug')({
  beforeLoad: async ({ params, context }) => {
    const { org, currentUser } = context as {
      org: Organization
      currentUser: User
    }
    const clients = await repositories.auth.getClients(org.id)
    const client = clients.find((c) => c.slug === params.clientSlug)
    if (!client) throw notFound()
    return { org, client, currentUser } satisfies {
      org: Organization
      client: Client
      currentUser: User
    }
  },
  component: ClientShell,
  notFoundComponent: NotFound,
})
```

- [ ] **Step 2: Smoke check**

```bash
npm run dev
```

- `/halo/heydude/shop` → works
- `/halo/nonexistent/shop` → "Page not found"
- `/halo/apex/shop` → renders Apex (now that fixtures exist)

- [ ] **Step 3: Commit**

```bash
git add src/routes/$orgSlug/$clientSlug/route.tsx
git commit -m "feat(routes): resolve client in beforeLoad; 404 on unknown slug"
```

### Task 4.4: Update useTenant + add useOrgTenant

**Files:**
- Modify: `src/modules/shared/hooks/use-tenant.ts`
- Create: `src/modules/shared/hooks/use-org-tenant.ts`

- [ ] **Step 1: Replace `use-tenant.ts`**

Overwrite `src/modules/shared/hooks/use-tenant.ts`:

```ts
import { useRouteContext } from '@tanstack/react-router'
import type { Client, Organization, User } from '@/modules/shared/types'

export function useTenant(): {
  org: Organization
  client: Client
  currentUser: User
  orgSlug: string
  clientSlug: string
} {
  const ctx = useRouteContext({ from: '/$orgSlug/$clientSlug' }) as {
    org: Organization
    client: Client
    currentUser: User
  }
  return {
    org: ctx.org,
    client: ctx.client,
    currentUser: ctx.currentUser,
    orgSlug: ctx.org.slug,
    clientSlug: ctx.client.slug,
  }
}
```

`orgSlug` and `clientSlug` are kept as derived fields so existing callers (e.g., `topbar.tsx`) that destructure `{ orgSlug, clientSlug }` continue to compile.

- [ ] **Step 2: Create `use-org-tenant.ts`**

Create `src/modules/shared/hooks/use-org-tenant.ts`:

```ts
import { useRouteContext } from '@tanstack/react-router'
import type { Organization, User } from '@/modules/shared/types'

export function useOrgTenant(): {
  org: Organization
  currentUser: User
  orgSlug: string
} {
  const ctx = useRouteContext({ from: '/$orgSlug' }) as {
    org: Organization
    currentUser: User
  }
  return {
    org: ctx.org,
    currentUser: ctx.currentUser,
    orgSlug: ctx.org.slug,
  }
}
```

- [ ] **Step 3: Run typecheck + dev**

`npx tsc --noEmit` — expect possible errors at every existing `useTenant()` call site that previously expected only `orgSlug` and `clientSlug` (those should still work via derived fields). Existing destructuring `const { orgSlug, clientSlug } = useTenant()` will keep working.

- [ ] **Step 4: Commit**

```bash
git add src/modules/shared/hooks/use-tenant.ts src/modules/shared/hooks/use-org-tenant.ts
git commit -m "feat(hooks): useTenant reads route context; add useOrgTenant"
```

### Task 4.5: Replace hard-coded redirect at `/`

**Files:**
- Modify: `src/routes/index.tsx`

- [ ] **Step 1: Overwrite the file**

```tsx
import { createFileRoute, redirect } from '@tanstack/react-router'
import { repositories } from '@/data'
import { useAuthStore } from '@/stores/auth.store'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const user = useAuthStore.getState().user
    const orgs = await repositories.auth.getOrganizations()
    const org = orgs.find((o) => o.id === user.organizationId)
    if (!org) {
      throw redirect({ to: '/login' })
    }
    const clients = await repositories.auth.getClients(org.id)
    const client = clients[0]
    if (!client) {
      throw redirect({ to: '/login' })
    }
    throw redirect({
      to: '/$orgSlug/$clientSlug/shop',
      params: { orgSlug: org.slug, clientSlug: client.slug },
    })
  },
})
```

- [ ] **Step 2: Smoke check**

`npm run dev`. http://localhost:5174 → redirects to `/halo/heydude/shop` (user-1 logged in). Once the fake-user switcher exists (Phase 6), changing to user-2 will land on `/beam/nova/shop`.

- [ ] **Step 3: Commit**

```bash
git add src/routes/index.tsx
git commit -m "feat(routes): root redirect driven by current fake user"
```

---

## Phase 5 — Hook cleanup (remove hard-coded ids)

Phase goal: Eliminate every `'client-1'` / `"HEYDUDE"` reference outside fixtures, route real ids through hooks, and rewrite `useAgencyOverview`.

### Task 5.1: Rewrite useAgencyOverview to fan out

**Files:**
- Modify: `src/modules/shared/hooks/use-agency-overview.ts`

- [ ] **Step 1: Replace the file**

Overwrite `src/modules/shared/hooks/use-agency-overview.ts`:

```ts
import { useQueries, useQuery } from '@tanstack/react-query'
import { repositories } from '@/data'
import type { Client } from '@/modules/shared/types'

const RANGE = {
  from: new Date('2025-10-01'),
  to: new Date('2025-10-31'),
}

export interface ClientOverview {
  client: Client
  shop: Awaited<ReturnType<typeof repositories.shop.getDailyMetrics>>
  ads: Awaited<ReturnType<typeof repositories.ads.getDailyMetrics>>
  creators: Awaited<ReturnType<typeof repositories.creators.getCreators>>
}

export function useAgencyOverview(orgId: string): {
  isLoading: boolean
  clients: Array<{ data: ClientOverview | undefined; isLoading: boolean }>
} {
  const clientsQuery = useQuery({
    queryKey: ['agency', 'overview', 'clients', orgId],
    queryFn: () => repositories.auth.getClients(orgId),
  })

  const clients = clientsQuery.data ?? []

  const queries = useQueries({
    queries: clients.map((client) => ({
      queryKey: [
        'agency',
        'overview',
        'client',
        orgId,
        client.id,
        RANGE.from.toISOString(),
        RANGE.to.toISOString(),
      ],
      queryFn: async (): Promise<ClientOverview> => {
        const [shop, ads, creators] = await Promise.all([
          repositories.shop.getDailyMetrics(client.id, RANGE),
          repositories.ads.getDailyMetrics(client.id, RANGE),
          repositories.creators.getCreators(client.id),
        ])
        return { client, shop, ads, creators }
      },
      enabled: clients.length > 0,
    })),
  })

  return {
    isLoading: clientsQuery.isLoading || queries.some((q) => q.isLoading),
    clients: queries.map((q) => ({ data: q.data, isLoading: q.isLoading })),
  }
}
```

- [ ] **Step 2: Commit (page update follows in 5.2)**

```bash
git add src/modules/shared/hooks/use-agency-overview.ts
git commit -m "feat(agency): useAgencyOverview fans out across the org's clients"
```

### Task 5.2: Update agency-overview-page.tsx to render the array

**Files:**
- Modify: `src/modules/shared/components/agency-overview-page.tsx`

- [ ] **Step 1: Replace the file**

Overwrite `src/modules/shared/components/agency-overview-page.tsx`:

```tsx
import { Link } from '@tanstack/react-router'
import { useAgencyOverview, type ClientOverview } from '@/modules/shared/hooks/use-agency-overview'
import { useOrgTenant } from '@/modules/shared/hooks/use-org-tenant'
import { formatCurrency, formatNumber } from '@/lib/utils'
import type { ShopDailyMetric } from '@/modules/shop/types'
import type { AdsDailyMetric } from '@/modules/ads/types'

function sumShop(data: ShopDailyMetric[], key: keyof ShopDailyMetric): number {
  return data.reduce((acc, d) => acc + (d[key] as number), 0)
}

function avgAds(data: AdsDailyMetric[], key: keyof AdsDailyMetric): number {
  if (data.length === 0) return 0
  return data.reduce((acc, d) => acc + (d[key] as number), 0) / data.length
}

interface CardData {
  name: string
  slug: string
  gmv: number
  orders: number
  activeCreators: number
  roas: number
}

function summarize(o: ClientOverview): CardData {
  return {
    name: o.client.name,
    slug: o.client.slug,
    gmv: sumShop(o.shop, 'gmv'),
    orders: sumShop(o.shop, 'orders'),
    activeCreators: o.creators.filter((c) => c.p28dAffiliateGmv > 0).length,
    roas: avgAds(o.ads, 'roas'),
  }
}

function ClientCard({ data, orgSlug, loading }: { data: CardData; orgSlug: string; loading: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-base font-bold text-card-foreground">{data.name}</span>
          <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
            TikTok
          </span>
        </div>
        <Link
          to="/$orgSlug/$clientSlug/shop"
          params={{ orgSlug, clientSlug: data.slug }}
          className="text-xs font-medium text-primary hover:underline"
        >
          View Dashboard →
        </Link>
      </div>
      {loading ? (
        <div className="text-sm text-muted animate-pulse">Loading…</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="MTD GMV" value={formatCurrency(data.gmv)} />
          <Metric label="MTD Orders" value={formatNumber(data.orders)} />
          <Metric label="Active Creators" value={formatNumber(data.activeCreators)} />
          <Metric label="ROAS" value={`${data.roas.toFixed(2)}×`} />
        </div>
      )}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-xl font-bold text-card-foreground">{value}</div>
    </div>
  )
}

function AggKpiRow({ cards }: { cards: CardData[] }) {
  const totalGmv = cards.reduce((a, c) => a + c.gmv, 0)
  const totalOrders = cards.reduce((a, c) => a + c.orders, 0)
  const totalCreators = cards.reduce((a, c) => a + c.activeCreators, 0)
  const avgRoas =
    cards.length === 0 ? 0 : cards.reduce((a, c) => a + c.roas, 0) / cards.length

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {[
        { label: 'Total GMV', value: formatCurrency(totalGmv) },
        { label: 'Total Orders', value: formatNumber(totalOrders) },
        { label: 'Total Creators', value: formatNumber(totalCreators) },
        { label: 'Avg ROAS', value: `${avgRoas.toFixed(2)}×` },
      ].map(({ label, value }) => (
        <div key={label} className="rounded-lg border border-border bg-card p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted">{label}</div>
          <div className="mt-1 text-2xl font-bold text-card-foreground">{value}</div>
        </div>
      ))}
    </div>
  )
}

export function AgencyOverviewPage() {
  const { org, orgSlug } = useOrgTenant()
  const { clients, isLoading } = useAgencyOverview(org.id)

  const cards: CardData[] = clients
    .map((q) => (q.data ? summarize(q.data) : null))
    .filter((c): c is CardData => c !== null)

  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-6">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold tracking-tight text-primary">SCC</span>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span>/</span>
            <span>{org.name}</span>
            <span>/</span>
            <span className="font-medium text-card-foreground">Agency Overview</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/$orgSlug/launch-scenarios"
            params={{ orgSlug }}
            className="text-sm font-medium text-primary hover:underline"
          >
            Launch Scenarios →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Agency Overview — {org.name}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Cross-client performance snapshot · MTD (October 2025)
          </p>
        </div>

        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">
            All Clients — Combined
          </h2>
          <AggKpiRow cards={cards} />
        </section>

        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">Clients</h2>
          {clients.length === 0 && !isLoading && (
            <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted">
              This organization has no clients yet.
            </div>
          )}
          {clients.map((q, i) =>
            q.data ? (
              <ClientCard
                key={q.data.client.id}
                data={summarize(q.data)}
                orgSlug={orgSlug}
                loading={false}
              />
            ) : (
              <div key={i} className="rounded-xl border border-border bg-card p-6 text-sm text-muted animate-pulse">
                Loading client…
              </div>
            ),
          )}
        </section>
      </main>
    </div>
  )
}
```

The previous "Back to client" link and `BRAND_B_MOCK` constant are gone. The page now renders whatever clients the current org has.

- [ ] **Step 2: Smoke check**

`npm run dev`. Visit `/halo/overview` — shows HEYDUDE + Apex cards with their respective metrics.

- [ ] **Step 3: Commit**

```bash
git add src/modules/shared/components/agency-overview-page.tsx
git commit -m "feat(agency): render dynamic per-client cards from useAgencyOverview"
```

### Task 5.3: Replace `'client-1'` in route loaders

**Files:**
- Modify: `src/routes/$orgSlug/$clientSlug/{shop,videos,ads,creators,content,samples,scorecards,workflow,calendar,flags}.tsx`

These route files use `repositories.X.getY('client-1', ...)` in their `loader`/`beforeLoad`. They have access to the route context, which now includes `client`. Update each to use the resolved `clientId`.

- [ ] **Step 1: Update each route loader to read `client` from context**

Pattern — `src/routes/$orgSlug/$clientSlug/shop.tsx`:

```tsx
import { createFileRoute } from '@tanstack/react-router'
import { repositories } from '@/data'
import { ShopPage } from '@/modules/shop/components/shop-page'

const DEFAULT_RANGE = {
  from: new Date('2025-10-01'),
  to: new Date('2025-10-31'),
}

export const Route = createFileRoute('/$orgSlug/$clientSlug/shop')({
  loader: async ({ context }) => {
    const { client } = context as { client: { id: string } }
    const { queryClient } = context as { queryClient: import('@tanstack/react-query').QueryClient }
    return queryClient.ensureQueryData({
      queryKey: ['shop', 'daily', client.id, DEFAULT_RANGE.from.toISOString(), DEFAULT_RANGE.to.toISOString()],
      queryFn: () => repositories.shop.getDailyMetrics(client.id, DEFAULT_RANGE),
    })
  },
  component: ShopPage,
})
```

(Apply the same pattern to videos, ads, creators, content, samples, scorecards, workflow, calendar, flags. Each one has the same shape — replace `'client-1'` with `client.id` and add `client` to the destructured context.)

The exact existing `loader`/`createFileRoute` content for each file has already been read; copy the pattern to each.

- [ ] **Step 2: Run typecheck + dev**

`npx tsc --noEmit && npm run dev`. Visit each page on `/halo/heydude/...` and `/halo/apex/...` — both render their own data.

- [ ] **Step 3: Commit**

```bash
git add src/routes/$orgSlug/$clientSlug/*.tsx
git commit -m "feat(routes): per-page loaders resolve clientId from route context"
```

### Task 5.4: Replace `'client-1'` in module page components

**Files (all in `src/modules`):**
- `shop/components/shop-page.tsx:63`
- `videos/components/videos-page.tsx:12`
- `ads/components/ads-page.tsx:12`
- `creators/components/creators-page.tsx:25-29`
- `content/components/content-page.tsx:15-16`
- `samples/components/samples-page.tsx:17-20`
- `scorecards/components/scorecards-page.tsx:15-16`
- `workflow/components/workflow-page.tsx:9`
- `calendar/components/calendar-page.tsx:10`
- `flags/components/flags-page.tsx:42`
- `import/components/csv-import-wizard.tsx:98`

- [ ] **Step 1: Each file gets the same edit**

At the top of each component, replace the literal `'client-1'` with the resolved id from `useTenant()`. Pattern:

```tsx
import { useTenant } from '@/modules/shared/hooks/use-tenant'

export function ShopPage() {
  const { client } = useTenant()
  const { data, isLoading, isError } = useShopMetrics(client.id)
  // ...rest unchanged
}
```

Apply to every page listed above. Where multiple hooks are called with `'client-1'`, replace all of them with `client.id`.

- [ ] **Step 2: Replace `'client-1'` defaults in shared components**

These use `clientId = 'client-1'` as a default prop. Drop the default, make the prop required, and pass it from callers:

- `src/modules/calendar/components/calendar-view.tsx:59` — change `{ events, clientId = 'client-1' }: CalendarViewProps` to `{ events, clientId }: CalendarViewProps`. Find callers (likely `calendar-page.tsx`) and pass the resolved id.
- `src/modules/flags/components/flag-dialog.tsx:30` — same: drop default, pass from caller.
- `src/modules/workflow/components/workflow-checklist.tsx:188` — same.
- `src/modules/freshness/components/freshness-badge.tsx:18` — same.
- `src/modules/freshness/components/global-freshness-chip.tsx:24` — same.

- [ ] **Step 3: Update sidebar.tsx**

`src/modules/shared/components/sidebar.tsx:82` calls `useFlags('client-1')`. Replace with:

```tsx
import { useTenant } from '@/modules/shared/hooks/use-tenant'
// ...
const { client } = useTenant()
const { data: flags } = useFlags(client.id)
```

- [ ] **Step 4: Run typecheck + dev smoke**

`npx tsc --noEmit && npm run dev`. Visit each page on `/halo/apex/...` — confirm Apex's smaller datasets render correctly.

- [ ] **Step 5: Commit**

```bash
git add src/modules
git commit -m "feat(modules): resolve clientId from useTenant() everywhere"
```

### Task 5.5: Remove HEYDUDE/heydude literal references

**Files:**
- Modify: `src/modules/shared/components/settings-page.tsx`
- Modify: `src/modules/shared/components/login-page.tsx`
- Modify: `src/modules/launch/components/new-scenario-dialog.tsx` (placeholder strings only — leave them since they're UX hints, not data)

- [ ] **Step 1: Update settings-page.tsx**

Find the spans showing `HEYDUDE` and `heydude` literals (lines 25, 35). Replace with values from `useTenant()`:

```tsx
import { useTenant } from '@/modules/shared/hooks/use-tenant'
// ...
const { org, client } = useTenant()
// In the JSX:
<span className="text-sm text-card-foreground font-medium">{client.name}</span>
// ...
<span className="font-mono text-xs text-muted bg-muted/10 rounded px-2 py-0.5">{client.slug}</span>
```

If the page also has org references, use `{org.name}` / `{org.slug}` similarly.

- [ ] **Step 2: Update login-page.tsx**

Replace `window.location.href = '/halo/heydude/shop'` with a redirect through TanStack Router that uses the picked fake user's org/clients:

```tsx
import { useNavigate } from '@tanstack/react-router'
import { repositories } from '@/data'
import { useAuthStore } from '@/stores/auth.store'
// ...
const navigate = useNavigate()
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault()
  // existing setFakeUser call (or equivalent)
  const user = useAuthStore.getState().user
  const orgs = await repositories.auth.getOrganizations()
  const org = orgs.find((o) => o.id === user.organizationId)
  if (!org) return
  const clients = await repositories.auth.getClients(org.id)
  if (!clients[0]) return
  navigate({
    to: '/$orgSlug/$clientSlug/shop',
    params: { orgSlug: org.slug, clientSlug: clients[0].slug },
  })
}
```

(Read the existing login-page.tsx to see the current submit handler shape; adapt this pattern.)

- [ ] **Step 3: Leave new-scenario-dialog.tsx placeholders alone**

The `placeholder="e.g. HEYDUDE"` strings are UX hints, not data. They're acceptable.

- [ ] **Step 4: Run grep to confirm**

```bash
grep -rn "client-1\|'heydude'\|\"heydude\"" src --include="*.ts" --include="*.tsx" \
  | grep -v fixtures | grep -v generate-fixtures | grep -v new-scenario-dialog
```

Expected: empty output.

- [ ] **Step 5: Commit**

```bash
git add src/modules/shared/components
git commit -m "feat(modules): drop HEYDUDE/heydude literals; resolve from tenant"
```

### Task 5.6: Audit launch hooks for query keys

The launch hooks already key by `orgSlug` (and `clientSlug` where applicable), which is correct multi-tenant behavior. Verify no hidden hardcodes.

- [ ] **Step 1: Read `src/modules/launch/hooks.ts`**

Confirm every `useQuery`/`useMutation`/`setQueryData` call uses dynamic `orgSlug`/`clientSlug` arguments — no literal `'halo'` or `'heydude'` should appear.

- [ ] **Step 2: If any literal is found, fix it; otherwise no-op**

Likely no edits needed.

- [ ] **Step 3: Commit (if changes were made)**

If no changes, skip the commit step.

---

## Phase 6 — UI: switchers

### Task 6.1: Build the ClientSwitcher component

**Files:**
- Create: `src/modules/shared/components/client-switcher.tsx`

- [ ] **Step 1: Create the file**

```tsx
import { useState } from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown } from 'lucide-react'
import { useTenant } from '@/modules/shared/hooks/use-tenant'
import { repositories } from '@/data'

const PAGE_SUFFIXES = [
  'shop',
  'videos',
  'ads',
  'creators',
  'content',
  'samples',
  'scorecards',
  'workflow',
  'calendar',
  'flags',
  'import',
  'settings',
] as const

function pageSuffixFromPath(pathname: string): (typeof PAGE_SUFFIXES)[number] {
  for (const suffix of PAGE_SUFFIXES) {
    if (pathname.endsWith(`/${suffix}`)) return suffix
  }
  return 'shop'
}

export function ClientSwitcher() {
  const { org, client } = useTenant()
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const { data: clients } = useQuery({
    queryKey: ['auth', 'clients', org.id],
    queryFn: () => repositories.auth.getClients(org.id),
  })

  const suffix = pageSuffixFromPath(location.pathname)

  function pickClient(slug: string) {
    setOpen(false)
    navigate({
      to: `/$orgSlug/$clientSlug/${suffix}` as const,
      params: { orgSlug: org.slug, clientSlug: slug },
    }).catch(() => {
      navigate({
        to: '/$orgSlug/$clientSlug/shop',
        params: { orgSlug: org.slug, clientSlug: slug },
      })
    })
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded px-1.5 py-0.5 text-sm font-medium text-card-foreground hover:bg-muted/20"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{client.name}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted" />
      </button>
      {open && (
        <div
          className="absolute left-0 top-full z-30 mt-1 w-56 rounded-lg border border-border bg-card p-1 shadow-lg"
          role="listbox"
        >
          {(clients ?? []).map((c) => (
            <button
              key={c.id}
              type="button"
              role="option"
              aria-selected={c.id === client.id}
              onClick={() => pickClient(c.slug)}
              className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm hover:bg-muted/20 ${c.id === client.id ? 'text-primary' : 'text-card-foreground'}`}
            >
              <span>{c.name}</span>
              <span className="font-mono text-[10px] uppercase text-muted">{c.slug}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

The `as const` cast on the `to` field is intentional so TanStack Router's typing accepts a dynamic route string. If TS complains, fall back to typed `to: '/$orgSlug/$clientSlug/shop'` and add a `useEffect` to push the suffix-specific URL after navigation.

- [ ] **Step 2: Commit**

```bash
git add src/modules/shared/components/client-switcher.tsx
git commit -m "feat(ui): client-switcher dropdown for current org's clients"
```

### Task 6.2: Wire ClientSwitcher into Topbar

**Files:**
- Modify: `src/modules/shared/components/topbar.tsx`

- [ ] **Step 1: Replace the file**

```tsx
import { DateRangePicker } from './date-range-picker'
import { useTenant } from '@/modules/shared/hooks/use-tenant'
import { GlobalFreshnessChip } from '@/modules/freshness/components/global-freshness-chip'
import { ClientSwitcher } from './client-switcher'

export function Topbar() {
  const { org, client } = useTenant()

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold tracking-tight text-primary">SCC</span>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <span>/</span>
          <span>{org.name}</span>
          <span>/</span>
          <ClientSwitcher />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <GlobalFreshnessChip clientId={client.id} />
        <DateRangePicker />
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          EA
        </div>
      </div>
    </header>
  )
}
```

`GlobalFreshnessChip` must already accept `clientId`; if it currently has `clientId = 'client-1'` as a default that was removed in Task 5.4, this prop is required.

- [ ] **Step 2: Smoke check**

`npm run dev`. Click the client name in the topbar — dropdown opens, shows HEYDUDE + Apex (when on Halo). Pick Apex — URL becomes `/halo/apex/shop` (or whatever page you were on). Data updates.

- [ ] **Step 3: Commit**

```bash
git add src/modules/shared/components/topbar.tsx
git commit -m "feat(ui): topbar embeds client switcher"
```

### Task 6.3: Build the dev-only FakeUserSwitcher

**Files:**
- Create: `src/modules/shared/components/fake-user-switcher.tsx`

- [ ] **Step 1: Create the file**

```tsx
import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Wrench } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { FAKE_USERS } from '@/lib/fake-users'
import { repositories } from '@/data'

// Dev-only switcher. Remove or gate behind import.meta.env.DEV when real auth lands.
export function FakeUserSwitcher() {
  const [open, setOpen] = useState(false)
  const currentUser = useAuthStore((s) => s.user)
  const setFakeUser = useAuthStore((s) => s.setFakeUser)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  async function pick(userId: string) {
    setOpen(false)
    setFakeUser(userId)
    queryClient.clear()

    const next = FAKE_USERS.find((u) => u.id === userId)
    if (!next) return
    const orgs = await repositories.auth.getOrganizations()
    const org = orgs.find((o) => o.id === next.organizationId)
    if (!org) return
    const clients = await repositories.auth.getClients(org.id)
    const firstClient = clients[0]
    if (!firstClient) return

    navigate({
      to: '/$orgSlug/$clientSlug/shop',
      params: { orgSlug: org.slug, clientSlug: firstClient.slug },
    })
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-muted/20 hover:text-card-foreground"
        title="Dev: switch fake user"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Wrench className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-64 rounded-lg border border-border bg-card p-1 shadow-lg" role="listbox">
          <div className="px-2 py-1 text-[10px] uppercase tracking-wide text-muted">
            Dev: switch fake user
          </div>
          {FAKE_USERS.map((u) => (
            <button
              key={u.id}
              type="button"
              role="option"
              aria-selected={u.id === currentUser.id}
              onClick={() => pick(u.id)}
              className={`flex w-full flex-col gap-0.5 rounded px-2 py-1.5 text-left text-sm hover:bg-muted/20 ${u.id === currentUser.id ? 'text-primary' : 'text-card-foreground'}`}
            >
              <span className="font-medium">{u.name}</span>
              <span className="text-[11px] text-muted">
                {u.email} · {u.organizationId}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/modules/shared/components/fake-user-switcher.tsx
git commit -m "feat(ui): dev-only fake-user switcher (cache-clearing, redirects)"
```

### Task 6.4: Wire FakeUserSwitcher into Topbar

**Files:**
- Modify: `src/modules/shared/components/topbar.tsx`

- [ ] **Step 1: Replace the right-side block**

Update the right-side flex in `topbar.tsx`:

```tsx
import { FakeUserSwitcher } from './fake-user-switcher'
// ...
<div className="flex items-center gap-3">
  <GlobalFreshnessChip clientId={client.id} />
  <DateRangePicker />
  <FakeUserSwitcher />
  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
    EA
  </div>
</div>
```

- [ ] **Step 2: Smoke check**

`npm run dev`. Click the wrench icon — popover lists Edris (Halo) and Jordan (Beam). Pick Jordan — URL navigates to `/beam/nova/shop`, data shows Nova. The avatar circle still says "EA"; that's a cosmetic detail that can be parameterized by `currentUser.name` initials in a follow-up.

- [ ] **Step 3: Commit**

```bash
git add src/modules/shared/components/topbar.tsx
git commit -m "feat(ui): topbar wires fake-user switcher"
```

---

## Phase 7 — Tests + smoke pass

### Task 7.1: Run full test suite

- [ ] **Step 1: Run tests**

```bash
npm test
```

Expected: PASS — all per-adapter scoping tests + persistence isolation tests green.

- [ ] **Step 2: Fix any regressions inline**

If any test fails, fix the implementation (not the test) before moving on.

### Task 7.2: Manual smoke pass

Run the documented pass from the spec. `npm run dev`, then in a browser:

- [ ] **Step 1: Land on `/`** — should redirect to `/halo/heydude/shop` (user-1 default).
- [ ] **Step 2: Use client switcher in topbar** — pick Apex. URL becomes `/halo/apex/shop`, data shows Apex.
- [ ] **Step 3: Switch to a different page (e.g., creators), then use the client switcher** — page is preserved (`/halo/heydude/creators`).
- [ ] **Step 4: Open dev menu (wrench icon), switch to Jordan Taylor (Beam)** — URL navigates to `/beam/nova/shop`. React Query cache cleared, fresh queries. Sidebar/topbar show Beam Collective + Nova.
- [ ] **Step 5: As Jordan, manually visit `/halo/heydude/shop`** — redirected to `/beam/nova/shop` (cross-org URLs blocked).
- [ ] **Step 6: Visit `/halo/nonexistent/shop`** — "Page not found" page.
- [ ] **Step 7: Visit `/halo/apex/workflow` and add a task** — refresh — task persists. Use client switcher to HEYDUDE — task is gone (per-client persistence). Switch back to Apex — task is still there.
- [ ] **Step 8: Switch fake user back to Edris** — lands on `/halo/heydude/shop`. Cache cleared. Apex's saved task still persists in localStorage but only visible via Apex tenant.
- [ ] **Step 9: Visit `/halo/overview`** — Agency Overview shows HEYDUDE + Apex cards with their respective metrics. Aggregate KPIs sum across both.
- [ ] **Step 10: Switch to Jordan, visit `/beam/overview`** — shows Nova + Pulse cards; HEYDUDE not visible.

If any step fails, file an inline fix before claiming completion.

### Task 7.3: Final commit

- [ ] **Step 1: Tag the smoke pass complete in the spec**

Edit `docs/superpowers/specs/2026-04-29-multi-tenant-design.md`. Change `**Status:** Design approved, awaiting implementation plan` to `**Status:** Implemented`.

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/specs/2026-04-29-multi-tenant-design.md
git commit -m "docs(specs): mark multi-tenant spec as implemented"
```

---

## Done

Multi-tenancy works end to end. Visiting any URL resolves through `beforeLoad`. Hooks read `clientId` and `orgId` from route context. Mock adapters filter every fixture by tenant. Persistence keys are namespaced. The client switcher and dev fake-user switcher are wired and clear cache cleanly.

When real auth lands later, the changes are surgical: replace `useAuthStore.getState().user` in the route loaders with the real session lookup, and gate or remove the `FakeUserSwitcher`. Everything else stays as-is.
