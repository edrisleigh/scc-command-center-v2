import type { WorkflowRepository } from '@/data/repositories/types'
import workflowData from '@/data/fixtures/workflow.json'
import type { WorkflowTask, WorkflowTaskInput } from '@/modules/workflow/types'
import { createScopedStore, generateId, type Scope } from './persist'

type Store = ReturnType<typeof createScopedStore<WorkflowTask[]>>

const stores = new Map<string, Store>()

function getStore(orgId: string, clientId: string): Store {
  const key = `${orgId}:${clientId}`
  let store = stores.get(key)
  if (!store) {
    const scope: Scope = { kind: 'client', orgId, clientId }
    store = createScopedStore<WorkflowTask[]>(scope, 'workflow.tasks', () =>
      (workflowData.tasks as WorkflowTask[])
        .filter((t) => t.clientId === clientId)
        .map((t) => ({
          ...t,
          createdAt: t.createdAt ?? new Date('2026-01-01').toISOString(),
        })),
    )
    stores.set(key, store)
  }
  return store
}

export function createMockWorkflowRepository(): WorkflowRepository {
  return {
    async getWorkflowTasks(orgId: string, clientId: string): Promise<WorkflowTask[]> {
      return getStore(orgId, clientId).read()
    },
    async createTask(
      orgId: string,
      clientId: string,
      input: WorkflowTaskInput,
      actor: string,
    ): Promise<WorkflowTask> {
      const store = getStore(orgId, clientId)
      const now = new Date().toISOString()
      const next: WorkflowTask = {
        clientId,
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
      orgId: string,
      clientId: string,
      id: string,
      patch: Partial<Omit<WorkflowTask, 'id' | 'createdAt'>>,
      actor: string,
    ): Promise<WorkflowTask> {
      const store = getStore(orgId, clientId)
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
    async deleteTask(orgId: string, clientId: string, id: string): Promise<void> {
      const store = getStore(orgId, clientId)
      store.write(store.read().filter((t) => t.id !== id))
    },
  }
}
