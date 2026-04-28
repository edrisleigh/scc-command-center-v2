import type { FreshnessRepository } from '@/data/repositories/types'
import type { FreshnessRecord, DataSource } from '@/modules/freshness/types'
import { createPersistedStore } from './persist'

const store = createPersistedStore<FreshnessRecord[]>('freshness.records', () => [])

export function createMockFreshnessRepository(): FreshnessRepository {
  return {
    async getFreshness(clientId: string): Promise<FreshnessRecord[]> {
      return store.read().filter((r) => r.clientId === clientId)
    },
    async recordRefresh(
      clientId: string,
      dataSource: DataSource,
      actor: string,
    ): Promise<FreshnessRecord> {
      const now = new Date().toISOString()
      const record: FreshnessRecord = {
        clientId,
        dataSource,
        updatedAt: now,
        updatedBy: actor,
      }
      const current = store.read()
      const filtered = current.filter(
        (r) => !(r.clientId === clientId && r.dataSource === dataSource),
      )
      store.write([...filtered, record])
      return record
    },
  }
}
