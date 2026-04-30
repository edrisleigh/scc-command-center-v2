import { createFileRoute } from '@tanstack/react-router'
import { WorkflowPage } from '@/modules/workflow/components/workflow-page'
import { repositories } from '@/data'

export const Route = createFileRoute('/$orgSlug/$clientSlug/workflow')({
  loader: ({ context: { queryClient, org, client } }) =>
    queryClient.ensureQueryData({
      queryKey: ['workflow', 'tasks', org.id, client.id],
      queryFn: () => repositories.workflow.getWorkflowTasks(org.id, client.id),
    }),
  component: WorkflowPage,
})
