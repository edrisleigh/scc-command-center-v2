import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { repositories } from '@/data'
import { useCurrentUser } from '@/modules/shared/hooks/use-current-user'
import type { DataSource, FreshnessRecord } from '@/modules/freshness/types'

export function useFreshness(orgId: string, clientId: string) {
  return useQuery({
    queryKey: ['freshness', orgId, clientId],
    queryFn: () => repositories.freshness.getFreshness(orgId, clientId),
  })
}

export function useFreshnessFor(orgId: string, clientId: string, source: DataSource) {
  const { data } = useFreshness(orgId, clientId)
  return data?.find((r) => r.dataSource === source) ?? null
}

export function useRecordRefresh(orgId: string, clientId: string) {
  const qc = useQueryClient()
  const user = useCurrentUser()
  return useMutation<FreshnessRecord, Error, DataSource>({
    mutationFn: (source: DataSource) =>
      repositories.freshness.recordRefresh(orgId, clientId, source, user.name),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['freshness', orgId, clientId] }),
  })
}
