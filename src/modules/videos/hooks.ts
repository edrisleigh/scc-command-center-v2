import { useQuery } from '@tanstack/react-query'
import { repositories } from '@/data'
import { useDateRange } from '@/modules/shared/hooks/use-date-range'

export function useVideoMetrics(clientId: string) {
  const [dateRange] = useDateRange()
  return useQuery({
    queryKey: ['video', 'daily', clientId, dateRange.from.toISOString(), dateRange.to.toISOString()],
    queryFn: () => repositories.video.getDailyMetrics(clientId, dateRange),
  })
}
