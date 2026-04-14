import { createFileRoute } from '@tanstack/react-router'
import { CreatorsPage } from '@/modules/creators/components/creators-page'
import { repositories } from '@/data'

export const Route = createFileRoute('/$orgSlug/$clientSlug/creators')({
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData({
        queryKey: ['creators', 'client-1'],
        queryFn: () => repositories.creators.getCreators('client-1'),
      }),
      queryClient.ensureQueryData({
        queryKey: ['creators', 'live', 'client-1'],
        queryFn: () => repositories.creators.getLiveCreators('client-1'),
      }),
      queryClient.ensureQueryData({
        queryKey: ['creators', 'collabs', 'client-1'],
        queryFn: () => repositories.creators.getTargetCollabs('client-1'),
      }),
      queryClient.ensureQueryData({
        queryKey: ['creators', 'collaboration-data', 'client-1'],
        queryFn: () => repositories.creators.getCollaborationData('client-1'),
      }),
      queryClient.ensureQueryData({
        queryKey: ['creators', 'incentives', 'client-1'],
        queryFn: () => repositories.creators.getCreatorIncentives('client-1'),
      }),
    ]),
  component: CreatorsPage,
})
