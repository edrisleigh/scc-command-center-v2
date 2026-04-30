import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { repositories } from '@/data'
import { useCurrentUser } from '@/modules/shared/hooks/use-current-user'
import type { FlagInput, FlagStatus } from '@/modules/flags/types'

const key = (orgId: string, clientId: string) => ['flags', orgId, clientId]

export function useFlags(orgId: string, clientId: string) {
  return useQuery({
    queryKey: key(orgId, clientId),
    queryFn: () => repositories.flags.getFlags(orgId, clientId),
  })
}

export function useCreateFlag(orgId: string, clientId: string) {
  const qc = useQueryClient()
  const user = useCurrentUser()
  return useMutation({
    mutationFn: (input: FlagInput) =>
      repositories.flags.createFlag(orgId, clientId, input, user.name),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(orgId, clientId) }),
  })
}

export function useUpdateFlagStatus(orgId: string, clientId: string) {
  const qc = useQueryClient()
  const user = useCurrentUser()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: FlagStatus }) =>
      repositories.flags.updateFlagStatus(orgId, clientId, id, status, user.name),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(orgId, clientId) }),
  })
}

export function useAssignFlag(orgId: string, clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, assignee }: { id: string; assignee: string }) =>
      repositories.flags.assignFlag(orgId, clientId, id, assignee),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(orgId, clientId) }),
  })
}

export function useAddFlagComment(orgId: string, clientId: string) {
  const qc = useQueryClient()
  const user = useCurrentUser()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) =>
      repositories.flags.addComment(orgId, clientId, id, body, user.name),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(orgId, clientId) }),
  })
}

export function useDeleteFlag(orgId: string, clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => repositories.flags.deleteFlag(orgId, clientId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(orgId, clientId) }),
  })
}
