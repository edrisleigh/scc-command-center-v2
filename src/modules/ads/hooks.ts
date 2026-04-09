import { useQuery } from '@tanstack/react-query'
import { repositories } from '@/data'
import { useDateRange } from '@/modules/shared/hooks/use-date-range'

export function useAdsMetrics(clientId: string) {
  const [dateRange] = useDateRange()
  return useQuery({
    queryKey: ['ads', 'daily', clientId, dateRange.from.toISOString(), dateRange.to.toISOString()],
    queryFn: () => repositories.ads.getDailyMetrics(clientId, dateRange),
  })
}
