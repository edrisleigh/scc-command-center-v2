import { createFileRoute } from '@tanstack/react-router'
import { FlagsPage } from '@/modules/flags/components/flags-page'
import { repositories } from '@/data'

export const Route = createFileRoute('/$orgSlug/$clientSlug/flags')({
  loader: ({ context: { queryClient, org, client } }) =>
    queryClient.ensureQueryData({
      queryKey: ['flags', org.id, client.id],
      queryFn: () => repositories.flags.getFlags(org.id, client.id),
    }),
  component: FlagsPage,
})
