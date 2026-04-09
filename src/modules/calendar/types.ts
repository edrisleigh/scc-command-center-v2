export interface CalendarEvent {
  id: string
  date: string
  title: string
  type: 'campaign' | 'launch' | 'tt_promo' | 'internal'
  owner: string
  notes: string
}
