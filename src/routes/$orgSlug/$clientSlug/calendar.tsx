import { createFileRoute } from '@tanstack/react-router'
import { CalendarPage } from '@/modules/calendar/components/calendar-page'
import { repositories } from '@/data'

export const Route = createFileRoute('/$orgSlug/$clientSlug/calendar')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData({
      queryKey: ['calendar', 'events', 'client-1'],
      queryFn: () => repositories.calendar.getEvents('client-1'),
    }),
  component: CalendarPage,
})
