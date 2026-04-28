import type { FlagsRepository } from '@/data/repositories/types'
import type { Flag, FlagInput, FlagStatus } from '@/modules/flags/types'
import { createPersistedStore, generateId } from './persist'

const store = createPersistedStore<Flag[]>('flags.records', () => [])

export function createMockFlagsRepository(): FlagsRepository {
  return {
    async getFlags(clientId) {
      return store.read().filter((f) => f.clientId === clientId)
    },

    async createFlag(clientId, input, actor) {
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
      const all = store.read()
      const idx = all.findIndex((f) => f.id === id && f.clientId === clientId)
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
      const all = store.read()
      const idx = all.findIndex((f) => f.id === id && f.clientId === clientId)
      if (idx < 0) throw new Error('Flag not found')
      const next: Flag = { ...all[idx], assignee }
      const copy = [...all]
      copy[idx] = next
      store.write(copy)
      return next
    },

    async addComment(clientId, id, body, actor) {
      const all = store.read()
      const idx = all.findIndex((f) => f.id === id && f.clientId === clientId)
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
      const all = store.read()
      store.write(all.filter((f) => !(f.id === id && f.clientId === clientId)))
    },
  }
}
