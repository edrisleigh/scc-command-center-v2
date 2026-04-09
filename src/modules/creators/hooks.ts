import { useQuery } from '@tanstack/react-query'
import { repositories } from '@/data'

export function useCreators(clientId: string) {
  return useQuery({
    queryKey: ['creators', clientId],
    queryFn: () => repositories.creators.getCreators(clientId),
  })
}

export function useCreatorById(clientId: string, creatorId: string) {
  return useQuery({
    queryKey: ['creators', clientId, creatorId],
    queryFn: () => repositories.creators.getCreatorById(clientId, creatorId),
    enabled: !!creatorId,
  })
}

export function useLiveCreators(clientId: string) {
  return useQuery({
    queryKey: ['creators', 'live', clientId],
    queryFn: () => repositories.creators.getLiveCreators(clientId),
  })
}

export function useTargetCollabs(clientId: string) {
  return useQuery({
    queryKey: ['creators', 'collabs', clientId],
    queryFn: () => repositories.creators.getTargetCollabs(clientId),
  })
}

export function useCollaborationData(clientId: string) {
  return useQuery({
    queryKey: ['creators', 'collaboration-data', clientId],
    queryFn: () => repositories.creators.getCollaborationData(clientId),
  })
}

export function useCreatorIncentives(clientId: string) {
  return useQuery({
    queryKey: ['creators', 'incentives', clientId],
    queryFn: () => repositories.creators.getCreatorIncentives(clientId),
  })
}
