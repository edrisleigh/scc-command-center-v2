import { createFileRoute } from '@tanstack/react-router'
import { VideosPage } from '@/modules/videos/components/videos-page'
import { repositories } from '@/data'

const DEFAULT_RANGE = { from: new Date('2026-03-01'), to: new Date('2026-04-13') }

export const Route = createFileRoute('/$orgSlug/$clientSlug/videos')({
  loader: ({ context: { queryClient, client } }) =>
    queryClient.ensureQueryData({
      queryKey: ['video', 'daily', client.id, DEFAULT_RANGE.from.toISOString(), DEFAULT_RANGE.to.toISOString()],
      queryFn: () => repositories.video.getDailyMetrics(client.id, DEFAULT_RANGE),
    }),
  component: VideosPage,
})
