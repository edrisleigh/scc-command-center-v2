import type { PlanningRepository } from '@/data/repositories/types'
import planningData from '@/data/fixtures/planning.json'
import type { PlanningPeriod, StrategyLever } from '@/modules/planning/types'

export function createMockPlanningRepository(): PlanningRepository {
  return {
    async getPlanningPeriods(_clientId: string): Promise<PlanningPeriod[]> {
      return planningData.planningPeriods as PlanningPeriod[]
    },
    async getStrategyLevers(_clientId: string): Promise<StrategyLever[]> {
      return planningData.strategyLevers as StrategyLever[]
    },
  }
}
