import { createFileRoute } from '@tanstack/react-router'
import { CreatorsPage } from '@/modules/creators/components/creators-page'
import { repositories } from '@/data'

export const Route = createFileRoute('/$orgSlug/$clientSlug/creators')({
  loader: ({ context: { queryClient, client } }) =>
    Promise.all([
      queryClient.ensureQueryData({
        queryKey: ['creators', client.id],
        queryFn: () => repositories.creators.getCreators(client.id),
      }),
      queryClient.ensureQueryData({
        queryKey: ['creators', 'live', client.id],
        queryFn: () => repositories.creators.getLiveCreators(client.id),
      }),
      queryClient.ensureQueryData({
        queryKey: ['creators', 'collabs', client.id],
        queryFn: () => repositories.creators.getTargetCollabs(client.id),
      }),
      queryClient.ensureQueryData({
        queryKey: ['creators', 'collaboration-data', client.id],
        queryFn: () => repositories.creators.getCollaborationData(client.id),
      }),
      queryClient.ensureQueryData({
        queryKey: ['creators', 'incentives', client.id],
        queryFn: () => repositories.creators.getCreatorIncentives(client.id),
      }),
    ]),
  component: CreatorsPage,
})
