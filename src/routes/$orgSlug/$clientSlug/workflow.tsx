import { createFileRoute } from '@tanstack/react-router'
import { WorkflowPage } from '@/modules/workflow/components/workflow-page'
import { repositories } from '@/data'

export const Route = createFileRoute('/$orgSlug/$clientSlug/workflow')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData({
      queryKey: ['workflow', 'tasks', 'client-1'],
      queryFn: () => repositories.workflow.getWorkflowTasks('client-1'),
    }),
  component: WorkflowPage,
})
