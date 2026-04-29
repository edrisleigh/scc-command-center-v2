import { createFileRoute } from '@tanstack/react-router'
import { ScorecardsPage } from '@/modules/scorecards/components/scorecards-page'
import { repositories } from '@/data'

export const Route = createFileRoute('/$orgSlug/$clientSlug/scorecards')({
  loader: ({ context: { queryClient, client } }) =>
    Promise.all([
      queryClient.ensureQueryData({
        queryKey: ['scorecards', 'weekly', client.id],
        queryFn: () => repositories.scorecards.getWeeklyScorecard(client.id),
      }),
      queryClient.ensureQueryData({
        queryKey: ['scorecards', 'monthly', client.id],
        queryFn: () => repositories.scorecards.getMonthlyScorecard(client.id),
      }),
    ]),
  component: ScorecardsPage,
})
