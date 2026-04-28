import { createFileRoute } from '@tanstack/react-router'
import { FlagsPage } from '@/modules/flags/components/flags-page'
import { repositories } from '@/data'

export const Route = createFileRoute('/$orgSlug/$clientSlug/flags')({
  loader: ({ context: { queryClient } }) =>
    queryClient.ensureQueryData({
      queryKey: ['flags', 'client-1'],
      queryFn: () => repositories.flags.getFlags('client-1'),
    }),
  component: FlagsPage,
})
