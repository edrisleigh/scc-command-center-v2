import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { repositories } from '@/data'
import type { CalendarEventInput } from '@/modules/calendar/types'
import { useCurrentUser } from '@/modules/shared/hooks/use-current-user'

export function useCalendarEvents(clientId: string) {
  return useQuery({
    queryKey: ['calendar', 'events', clientId],
    queryFn: () => repositories.calendar.getEvents(clientId),
  })
}

export function useCreateCalendarEvent(clientId: string) {
  const qc = useQueryClient()
  const user = useCurrentUser()
  return useMutation({
    mutationFn: (input: CalendarEventInput) =>
      repositories.calendar.createEvent(clientId, input, user.name),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['calendar', 'events', clientId] }),
  })
}

export function useUpdateCalendarEvent(clientId: string) {
  const qc = useQueryClient()
  const user = useCurrentUser()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<CalendarEventInput> }) =>
      repositories.calendar.updateEvent(clientId, id, patch, user.name),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['calendar', 'events', clientId] }),
  })
}

export function useDeleteCalendarEvent(clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => repositories.calendar.deleteEvent(clientId, id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['calendar', 'events', clientId] }),
  })
}
