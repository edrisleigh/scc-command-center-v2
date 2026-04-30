import type { ScorecardsRepository } from '@/data/repositories/types'
import scorecardsData from '@/data/fixtures/scorecards.json'
import type { WeeklyScorecard, MonthlyScorecard } from '@/modules/scorecards/types'

export function createMockScorecardsRepository(): ScorecardsRepository {
  return {
    async getWeeklyScorecard(clientId: string): Promise<WeeklyScorecard[]> {
      return (scorecardsData.weekly as WeeklyScorecard[]).filter(
        (s) => s.clientId === clientId,
      )
    },
    async getMonthlyScorecard(clientId: string): Promise<MonthlyScorecard[]> {
      return (scorecardsData.monthly as MonthlyScorecard[]).filter(
        (s) => s.clientId === clientId,
      )
    },
  }
}
