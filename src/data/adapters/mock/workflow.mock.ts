import type { WorkflowRepository } from '@/data/repositories/types'
import workflowData from '@/data/fixtures/workflow.json'
import type { WorkflowTask, WorkflowTaskInput } from '@/modules/workflow/types'
import { createPersistedStore, generateId } from './persist'

const store = createPersistedStore<WorkflowTask[]>('workflow.tasks', () =>
  (workflowData.tasks as WorkflowTask[]).map((t) => ({
    ...t,
    createdAt: t.createdAt ?? new Date('2026-01-01').toISOString(),
  })),
)

export function createMockWorkflowRepository(): WorkflowRepository {
  return {
    async getWorkflowTasks(_clientId: string): Promise<WorkflowTask[]> {
      return store.read()
    },
    async createTask(
      _clientId: string,
      input: WorkflowTaskInput,
      actor: string,
    ): Promise<WorkflowTask> {
      const now = new Date().toISOString()
      const next: WorkflowTask = {
        ...input,
        id: generateId('wf'),
        completedThisWeek: [false, false, false, false, false],
        createdAt: now,
        updatedAt: now,
        updatedBy: actor,
      }
      store.write([...store.read(), next])
      return next
    },
    async updateTask(
      _clientId: string,
      id: string,
      patch: Partial<Omit<WorkflowTask, 'id' | 'createdAt'>>,
      actor: string,
    ): Promise<WorkflowTask> {
      const current = store.read()
      const idx = current.findIndex((t) => t.id === id)
      if (idx === -1) throw new Error(`Workflow task not found: ${id}`)
      const updated: WorkflowTask = {
        ...current[idx],
        ...patch,
        updatedAt: new Date().toISOString(),
        updatedBy: actor,
      }
      const next = [...current]
      next[idx] = updated
      store.write(next)
      return updated
    },
    async deleteTask(_clientId: string, id: string): Promise<void> {
      store.write(store.read().filter((t) => t.id !== id))
    },
  }
}
