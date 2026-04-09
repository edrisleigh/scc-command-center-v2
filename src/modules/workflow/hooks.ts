import { useQuery } from '@tanstack/react-query'
import { repositories } from '@/data'

export function useWorkflowTasks(clientId: string) {
  return useQuery({
    queryKey: ['workflow', 'tasks', clientId],
    queryFn: () => repositories.workflow.getWorkflowTasks(clientId),
  })
}
