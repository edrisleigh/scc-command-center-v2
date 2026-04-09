import { useQuery } from '@tanstack/react-query'
import { repositories } from '@/data'
import { useDateRange } from '@/modules/shared/hooks/use-date-range'

export function useShopMetrics(clientId: string) {
  const [dateRange] = useDateRange()
  return useQuery({
    queryKey: ['shop', 'daily', clientId, dateRange.from.toISOString(), dateRange.to.toISOString()],
    queryFn: () => repositories.shop.getDailyMetrics(clientId, dateRange),
  })
}
