import { createFileRoute } from '@tanstack/react-router'
import { ScorecardsPage } from '@/modules/scorecards/components/scorecards-page'
import { repositories } from '@/data'

export const Route = createFileRoute('/$orgSlug/$clientSlug/scorecards')({
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData({
        queryKey: ['scorecards', 'weekly', 'client-1'],
        queryFn: () => repositories.scorecards.getWeeklyScorecard('client-1'),
      }),
      queryClient.ensureQueryData({
        queryKey: ['scorecards', 'monthly', 'client-1'],
        queryFn: () => repositories.scorecards.getMonthlyScorecard('client-1'),
      }),
    ]),
  component: ScorecardsPage,
})
