import { createFileRoute } from '@tanstack/react-router'
import { ShopPage } from '@/modules/shop/components/shop-page'
import { repositories } from '@/data'

const DEFAULT_RANGE = { from: new Date('2026-03-01'), to: new Date('2026-04-13') }

export const Route = createFileRoute('/$orgSlug/$clientSlug/shop')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData({
      queryKey: ['shop', 'daily', 'client-1', DEFAULT_RANGE.from.toISOString(), DEFAULT_RANGE.to.toISOString()],
      queryFn: () => repositories.shop.getDailyMetrics('client-1', DEFAULT_RANGE),
    }),
  component: ShopPage,
})
