import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { repositories } from '@/data'
import type { WorkflowTask, WorkflowTaskInput } from '@/modules/workflow/types'
import { useCurrentUser } from '@/modules/shared/hooks/use-current-user'

export function useWorkflowTasks(orgId: string, clientId: string) {
  return useQuery({
    queryKey: ['workflow', 'tasks', orgId, clientId],
    queryFn: () => repositories.workflow.getWorkflowTasks(orgId, clientId),
  })
}

export function useCreateWorkflowTask(orgId: string, clientId: string) {
  const qc = useQueryClient()
  const user = useCurrentUser()
  return useMutation({
    mutationFn: (input: WorkflowTaskInput) =>
      repositories.workflow.createTask(orgId, clientId, input, user.name),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['workflow', 'tasks', orgId, clientId] }),
  })
}

export function useUpdateWorkflowTask(orgId: string, clientId: string) {
  const qc = useQueryClient()
  const user = useCurrentUser()
  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string
      patch: Partial<Omit<WorkflowTask, 'id' | 'createdAt'>>
    }) => repositories.workflow.updateTask(orgId, clientId, id, patch, user.name),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['workflow', 'tasks', orgId, clientId] }),
  })
}

export function useDeleteWorkflowTask(orgId: string, clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => repositories.workflow.deleteTask(orgId, clientId, id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['workflow', 'tasks', orgId, clientId] }),
  })
}
