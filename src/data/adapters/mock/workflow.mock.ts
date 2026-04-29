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
        .filter((t) => (t as WorkflowTask & { clientId?: string }).clientId === clientId)
        .map((t) => ({
          ...t,
          createdAt: t.createdAt ?? new Date('2026-01-01').toISOString(),
        })),
    )
    stores.set(key, store)
  }
  return store
}

function ridOrgId(_clientId: string): string {
  return 'org-1' // temporary: until WorkflowRepository receives orgId in Phase 4
}

export function createMockWorkflowRepository(): WorkflowRepository {
  return {
    async getWorkflowTasks(clientId: string): Promise<WorkflowTask[]> {
      return getStore(ridOrgId(clientId), clientId).read()
    },
    async createTask(
      clientId: string,
      input: WorkflowTaskInput,
      actor: string,
    ): Promise<WorkflowTask> {
      const store = getStore(ridOrgId(clientId), clientId)
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
      clientId: string,
      id: string,
      patch: Partial<Omit<WorkflowTask, 'id' | 'createdAt'>>,
      actor: string,
    ): Promise<WorkflowTask> {
      const store = getStore(ridOrgId(clientId), clientId)
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
    async deleteTask(clientId: string, id: string): Promise<void> {
      const store = getStore(ridOrgId(clientId), clientId)
      store.write(store.read().filter((t) => t.id !== id))
    },
  }
}
