export type CalendarEventType = 'campaign' | 'launch' | 'tt_promo' | 'internal'

export interface CalendarEvent {
  clientId: string
  id: string
  date: string
  title: string
  type: CalendarEventType
  owner: string
  notes: string
  createdAt?: string
  updatedAt?: string
  updatedBy?: string
}

export type CalendarEventInput = Omit<CalendarEvent, 'clientId' | 'id' | 'createdAt' | 'updatedAt' | 'updatedBy'>
