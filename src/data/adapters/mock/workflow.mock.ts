import type { WorkflowRepository } from '@/data/repositories/types'
import workflowData from '@/data/fixtures/workflow.json'
import type { WorkflowTask } from '@/modules/workflow/types'

export function createMockWorkflowRepository(): WorkflowRepository {
  return {
    async getWorkflowTasks(_clientId: string): Promise<WorkflowTask[]> {
      return workflowData.tasks as WorkflowTask[]
    },
  }
}
