import { createFileRoute } from '@tanstack/react-router'
import { CalendarPage } from '@/modules/calendar/components/calendar-page'
import { repositories } from '@/data'

export const Route = createFileRoute('/$orgSlug/$clientSlug/calendar')({
  loader: ({ context: { queryClient, client } }) =>
    queryClient.ensureQueryData({
      queryKey: ['calendar', 'events', client.id],
      queryFn: () => repositories.calendar.getEvents(client.id),
    }),
  component: CalendarPage,
})
