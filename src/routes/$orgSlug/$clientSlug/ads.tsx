import { createFileRoute } from '@tanstack/react-router'
import { AdsPage } from '@/modules/ads/components/ads-page'
import { repositories } from '@/data'

const DEFAULT_RANGE = { from: new Date('2026-03-01'), to: new Date('2026-04-13') }

export const Route = createFileRoute('/$orgSlug/$clientSlug/ads')({
  loader: ({ context: { queryClient, client } }) =>
    queryClient.ensureQueryData({
      queryKey: ['ads', 'daily', client.id, DEFAULT_RANGE.from.toISOString(), DEFAULT_RANGE.to.toISOString()],
      queryFn: () => repositories.ads.getDailyMetrics(client.id, DEFAULT_RANGE),
    }),
  component: AdsPage,
})
