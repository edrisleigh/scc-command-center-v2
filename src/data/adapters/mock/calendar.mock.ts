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
        .filter((e) => e.clientId === clientId)
        .map((e) => ({
          ...e,
          createdAt: e.createdAt ?? new Date('2026-01-01').toISOString(),
        })),
    )
    stores.set(key, store)
  }
  return store
}

export function createMockCalendarRepository(): CalendarRepository {
  return {
    async getEvents(orgId: string, clientId: string): Promise<CalendarEvent[]> {
      return getStore(orgId, clientId).read()
    },
    async createEvent(
      orgId: string,
      clientId: string,
      input: CalendarEventInput,
      actor: string,
    ): Promise<CalendarEvent> {
      const store = getStore(orgId, clientId)
      const now = new Date().toISOString()
      const next: CalendarEvent = {
        clientId,
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
      orgId: string,
      clientId: string,
      id: string,
      patch: Partial<CalendarEventInput>,
      actor: string,
    ): Promise<CalendarEvent> {
      const store = getStore(orgId, clientId)
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
    async deleteEvent(orgId: string, clientId: string, id: string): Promise<void> {
      const store = getStore(orgId, clientId)
      store.write(store.read().filter((e) => e.id !== id))
    },
  }
}
