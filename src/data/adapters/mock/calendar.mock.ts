import type { CalendarRepository } from '@/data/repositories/types'
import calendarData from '@/data/fixtures/calendar.json'
import type { CalendarEvent, CalendarEventInput } from '@/modules/calendar/types'
import { createPersistedStore, generateId } from './persist'

const store = createPersistedStore<CalendarEvent[]>('calendar.events', () =>
  (calendarData.events as CalendarEvent[]).map((e) => ({
    ...e,
    createdAt: e.createdAt ?? new Date('2026-01-01').toISOString(),
  })),
)

export function createMockCalendarRepository(): CalendarRepository {
  return {
    async getEvents(_clientId: string): Promise<CalendarEvent[]> {
      return store.read()
    },
    async createEvent(
      _clientId: string,
      input: CalendarEventInput,
      actor: string,
    ): Promise<CalendarEvent> {
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
      _clientId: string,
      id: string,
      patch: Partial<CalendarEventInput>,
      actor: string,
    ): Promise<CalendarEvent> {
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
    async deleteEvent(_clientId: string, id: string): Promise<void> {
      store.write(store.read().filter((e) => e.id !== id))
    },
  }
}
