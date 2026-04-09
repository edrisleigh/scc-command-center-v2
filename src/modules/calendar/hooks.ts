import { useQuery } from '@tanstack/react-query'
import { repositories } from '@/data'

export function useCalendarEvents(clientId: string) {
  return useQuery({
    queryKey: ['calendar', 'events', clientId],
    queryFn: () => repositories.calendar.getEvents(clientId),
  })
}
