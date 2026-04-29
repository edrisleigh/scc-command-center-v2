import { createFileRoute } from '@tanstack/react-router'
import { WorkflowPage } from '@/modules/workflow/components/workflow-page'
import { repositories } from '@/data'

export const Route = createFileRoute('/$orgSlug/$clientSlug/workflow')({
  loader: ({ context: { queryClient, client } }) =>
    queryClient.ensureQueryData({
      queryKey: ['workflow', 'tasks', client.id],
      queryFn: () => repositories.workflow.getWorkflowTasks(client.id),
    }),
  component: WorkflowPage,
})
