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
  return 'org-1' // temporary: until FlagsRepository receives orgId in Phase 4
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
