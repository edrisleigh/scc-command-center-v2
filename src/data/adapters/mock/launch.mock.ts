import type { LaunchRepository } from '@/data/repositories/types'
import type { LaunchScenario, ScenarioKey } from '@/modules/launch/types'
import { defaultScenarioInputs, defaultSharedInputs } from '@/modules/launch/defaults'
import seed from '@/data/fixtures/launch-scenarios.json'

export function createMockLaunchRepository(): LaunchRepository {
  const store = new Map<string, LaunchScenario>(
    (seed as LaunchScenario[]).map((s) => [s.id, structuredClone(s)]),
  )

  const nowIso = () => new Date().toISOString()

  return {
    async list(orgSlug) {
      return Array.from(store.values()).filter((s) => s.orgSlug === orgSlug)
    },
    async getById(scenarioId) {
      const s = store.get(scenarioId)
      return s ? structuredClone(s) : null
    },
    async getByClientSlug(orgSlug, clientSlug) {
      for (const s of store.values()) {
        if (s.orgSlug === orgSlug && s.clientSlug === clientSlug) {
          return structuredClone(s)
        }
      }
      return null
    },
    async create({ orgSlug, prospectName, name }) {
      const id = `ls-${Math.random().toString(36).slice(2, 10)}`
      const created: LaunchScenario = {
        id,
        orgSlug,
        clientSlug: null,
        prospectName,
        name,
        status: 'draft',
        chosenScenarioKey: null,
        sharedInputs: structuredClone(defaultSharedInputs),
        scenarios: structuredClone(defaultScenarioInputs),
        createdAt: nowIso(),
        updatedAt: nowIso(),
        lockedAt: null,
        lockedBy: null,
      }
      store.set(id, structuredClone(created))
      return created
    },
    async save(scenario) {
      const next: LaunchScenario = { ...scenario, updatedAt: nowIso() }
      store.set(scenario.id, structuredClone(next))
      return structuredClone(next)
    },
    async lock(scenarioId, chosenScenarioKey: ScenarioKey) {
      const s = store.get(scenarioId)
      if (!s) throw new Error(`scenario ${scenarioId} not found`)
      const next: LaunchScenario = {
        ...s,
        status: 'locked',
        chosenScenarioKey,
        lockedAt: nowIso(),
        lockedBy: null,
        updatedAt: nowIso(),
      }
      store.set(scenarioId, structuredClone(next))
      return structuredClone(next)
    },
    async linkToClient(scenarioId, clientSlug) {
      const s = store.get(scenarioId)
      if (!s) throw new Error(`scenario ${scenarioId} not found`)
      const next: LaunchScenario = { ...s, clientSlug, updatedAt: nowIso() }
      store.set(scenarioId, structuredClone(next))
      return structuredClone(next)
    },
  }
}
