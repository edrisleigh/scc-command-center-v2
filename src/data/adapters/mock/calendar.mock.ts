import type { CalendarRepository } from '@/data/repositories/types'
import calendarData from '@/data/fixtures/calendar.json'
import type { CalendarEvent } from '@/modules/calendar/types'

export function createMockCalendarRepository(): CalendarRepository {
  return {
    async getEvents(_clientId: string): Promise<CalendarEvent[]> {
      return calendarData.events as CalendarEvent[]
    },
  }
}
