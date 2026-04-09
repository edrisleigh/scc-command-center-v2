import { useQuery } from '@tanstack/react-query'
import { repositories } from '@/data'

export function usePlanningPeriods(clientId: string) {
  return useQuery({
    queryKey: ['planning', 'periods', clientId],
    queryFn: () => repositories.planning.getPlanningPeriods(clientId),
  })
}

export function useStrategyLevers(clientId: string) {
  return useQuery({
    queryKey: ['planning', 'levers', clientId],
    queryFn: () => repositories.planning.getStrategyLevers(clientId),
  })
}
