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
  return 'org-1' // temporary: until FreshnessRepository receives orgId in Phase 4
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
