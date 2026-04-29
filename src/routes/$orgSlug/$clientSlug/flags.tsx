import { createFileRoute } from '@tanstack/react-router'
import { FlagsPage } from '@/modules/flags/components/flags-page'
import { repositories } from '@/data'

export const Route = createFileRoute('/$orgSlug/$clientSlug/flags')({
  loader: ({ context: { queryClient, client } }) =>
    queryClient.ensureQueryData({
      queryKey: ['flags', client.id],
      queryFn: () => repositories.flags.getFlags(client.id),
    }),
  component: FlagsPage,
})
