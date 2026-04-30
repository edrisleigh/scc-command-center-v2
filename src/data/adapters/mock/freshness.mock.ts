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

export function createMockFreshnessRepository(): FreshnessRepository {
  return {
    async getFreshness(orgId: string, clientId: string): Promise<FreshnessRecord[]> {
      return getStore(orgId, clientId).read()
    },
    async recordRefresh(
      orgId: string,
      clientId: string,
      dataSource: DataSource,
      actor: string,
    ): Promise<FreshnessRecord> {
      const store = getStore(orgId, clientId)
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
