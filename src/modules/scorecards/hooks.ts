import { useQuery } from '@tanstack/react-query'
import { repositories } from '@/data'

export function useWeeklyScorecard(clientId: string) {
  return useQuery({
    queryKey: ['scorecards', 'weekly', clientId],
    queryFn: () => repositories.scorecards.getWeeklyScorecard(clientId),
  })
}

export function useMonthlyScorecard(clientId: string) {
  return useQuery({
    queryKey: ['scorecards', 'monthly', clientId],
    queryFn: () => repositories.scorecards.getMonthlyScorecard(clientId),
  })
}
