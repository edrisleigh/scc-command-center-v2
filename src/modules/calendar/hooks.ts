import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { repositories } from '@/data'
import type { CalendarEventInput } from '@/modules/calendar/types'
import { useCurrentUser } from '@/modules/shared/hooks/use-current-user'

export function useCalendarEvents(orgId: string, clientId: string) {
  return useQuery({
    queryKey: ['calendar', 'events', orgId, clientId],
    queryFn: () => repositories.calendar.getEvents(orgId, clientId),
  })
}

export function useCreateCalendarEvent(orgId: string, clientId: string) {
  const qc = useQueryClient()
  const user = useCurrentUser()
  return useMutation({
    mutationFn: (input: CalendarEventInput) =>
      repositories.calendar.createEvent(orgId, clientId, input, user.name),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['calendar', 'events', orgId, clientId] }),
  })
}

export function useUpdateCalendarEvent(orgId: string, clientId: string) {
  const qc = useQueryClient()
  const user = useCurrentUser()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<CalendarEventInput> }) =>
      repositories.calendar.updateEvent(orgId, clientId, id, patch, user.name),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['calendar', 'events', orgId, clientId] }),
  })
}

export function useDeleteCalendarEvent(orgId: string, clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => repositories.calendar.deleteEvent(orgId, clientId, id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['calendar', 'events', orgId, clientId] }),
  })
}
