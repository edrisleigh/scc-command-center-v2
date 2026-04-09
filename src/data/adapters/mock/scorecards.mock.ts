import type { ScorecardsRepository } from '@/data/repositories/types'
import type { WeeklyScorecard, MonthlyScorecard } from '@/modules/scorecards/types'
import scorecardsData from '@/data/fixtures/scorecards.json'

export function createMockScorecardsRepository(): ScorecardsRepository {
  return {
    async getWeeklyScorecard(_clientId: string): Promise<WeeklyScorecard[]> {
      return scorecardsData.weekly as WeeklyScorecard[]
    },
    async getMonthlyScorecard(_clientId: string): Promise<MonthlyScorecard[]> {
      return scorecardsData.monthly as MonthlyScorecard[]
    },
  }
}
