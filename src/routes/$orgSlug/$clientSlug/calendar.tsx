import { createFileRoute } from '@tanstack/react-router'
import { CalendarPage } from '@/modules/calendar/components/calendar-page'
import { repositories } from '@/data'

export const Route = createFileRoute('/$orgSlug/$clientSlug/calendar')({
  loader: ({ context: { queryClient, org, client } }) =>
    queryClient.ensureQueryData({
      queryKey: ['calendar', 'events', org.id, client.id],
      queryFn: () => repositories.calendar.getEvents(org.id, client.id),
    }),
  component: CalendarPage,
})
