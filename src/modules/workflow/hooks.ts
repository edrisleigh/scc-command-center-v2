import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { repositories } from '@/data'
import type { WorkflowTask, WorkflowTaskInput } from '@/modules/workflow/types'
import { useCurrentUser } from '@/modules/shared/hooks/use-current-user'

export function useWorkflowTasks(clientId: string) {
  return useQuery({
    queryKey: ['workflow', 'tasks', clientId],
    queryFn: () => repositories.workflow.getWorkflowTasks(clientId),
  })
}

export function useCreateWorkflowTask(clientId: string) {
  const qc = useQueryClient()
  const user = useCurrentUser()
  return useMutation({
    mutationFn: (input: WorkflowTaskInput) =>
      repositories.workflow.createTask(clientId, input, user.name),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['workflow', 'tasks', clientId] }),
  })
}

export function useUpdateWorkflowTask(clientId: string) {
  const qc = useQueryClient()
  const user = useCurrentUser()
  return useMutation({
    mutationFn: ({
      id,
      patch,
    }: {
      id: string
      patch: Partial<Omit<WorkflowTask, 'id' | 'createdAt'>>
    }) => repositories.workflow.updateTask(clientId, id, patch, user.name),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['workflow', 'tasks', clientId] }),
  })
}

export function useDeleteWorkflowTask(clientId: string) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => repositories.workflow.deleteTask(clientId, id),
    onSuccess: () =>
      qc.invalidateQueries({ queryKey: ['workflow', 'tasks', clientId] }),
  })
}
