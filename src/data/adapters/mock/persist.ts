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
