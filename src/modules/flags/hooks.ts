import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { repositories } from '@/data'
import { useCurrentUser } from '@/modules/shared/hooks/use-current-user'
import type { FlagInput, FlagStatus } from '@/modules/flags/types'

const key = (clientId: string) => ['flags', clientId]

export function useFlags(clientId: string) {
  return useQuery({
    queryKey: key(clientId),
    queryFn: () => repositories.flags.getFlags(clientId),
  })
}

export function useCreateFlag(clientId: string) {
  const qc = useQueryClient()
  const user = useCurrentUser()
  return useMutation({
    mutationFn: (input: FlagInput) =>
      repositories.flags.createFlag(clientId, input, user.name),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(clientId) }),
  })
}

export function useUpdateFlagStatus(clientId: string) {
  const qc = useQueryClient()
  const user = useCurrentUser()
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: FlagStatus }) =>
      repositories.flags.updateFlagStatus(clientId, id, status, user.name),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(clientId) }),
  })
}

export function useAssignFlag(clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, assignee }: { id: string; assignee: string }) =>
      repositories.flags.assignFlag(clientId, id, assignee),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(clientId) }),
  })
}

export function useAddFlagComment(clientId: string) {
  const qc = useQueryClient()
  const user = useCurrentUser()
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) =>
      repositories.flags.addComment(clientId, id, body, user.name),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(clientId) }),
  })
}

export function useDeleteFlag(clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => repositories.flags.deleteFlag(clientId, id),
    onSuccess: () => qc.invalidateQueries({ queryKey: key(clientId) }),
  })
}
