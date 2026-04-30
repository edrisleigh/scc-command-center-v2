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
