const NAMESPACE = 'scc-mock:'

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

export function readPersisted<T>(key: string): T | null {
  if (!isBrowser()) return null
  try {
    const raw = window.localStorage.getItem(NAMESPACE + key)
    if (raw === null) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export function writePersisted<T>(key: string, value: T): void {
  if (!isBrowser()) return
  try {
    window.localStorage.setItem(NAMESPACE + key, JSON.stringify(value))
  } catch {
    // swallow quota/serialization errors — mock only
  }
}

export function createPersistedStore<T>(key: string, seed: () => T) {
  let cache: T | null = null

  function load(): T {
    if (cache !== null) return cache
    const persisted = readPersisted<T>(key)
    if (persisted !== null) {
      cache = persisted
      return persisted
    }
    const seeded = seed()
    cache = seeded
    writePersisted(key, seeded)
    return seeded
  }

  function save(next: T): void {
    cache = next
    writePersisted(key, next)
  }

  return {
    read: load,
    write: save,
  }
}

export function generateId(prefix: string): string {
  const rand = Math.random().toString(36).slice(2, 8)
  return `${prefix}-${Date.now().toString(36)}-${rand}`
}
