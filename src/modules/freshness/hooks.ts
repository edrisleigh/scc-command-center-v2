import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { repositories } from '@/data'
import { useCurrentUser } from '@/modules/shared/hooks/use-current-user'
import type { DataSource, FreshnessRecord } from '@/modules/freshness/types'

export function useFreshness(clientId: string) {
  return useQuery({
    queryKey: ['freshness', clientId],
    queryFn: () => repositories.freshness.getFreshness(clientId),
  })
}

export function useFreshnessFor(clientId: string, source: DataSource) {
  const { data } = useFreshness(clientId)
  return data?.find((r) => r.dataSource === source) ?? null
}

export function useRecordRefresh(clientId: string) {
  const qc = useQueryClient()
  const user = useCurrentUser()
  return useMutation<FreshnessRecord, Error, DataSource>({
    mutationFn: (source: DataSource) =>
      repositories.freshness.recordRefresh(clientId, source, user.name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['freshness', clientId] }),
  })
}
