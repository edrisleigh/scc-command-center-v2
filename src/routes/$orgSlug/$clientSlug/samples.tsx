import { createFileRoute } from '@tanstack/react-router'
import { SamplesPage } from '@/modules/samples/components/samples-page'
import { repositories } from '@/data'

export const Route = createFileRoute('/$orgSlug/$clientSlug/samples')({
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData({
        queryKey: ['samples', 'products', 'client-1'],
        queryFn: () => repositories.samples.getProducts('client-1'),
      }),
      queryClient.ensureQueryData({
        queryKey: ['samples', 'orders', 'client-1'],
        queryFn: () => repositories.samples.getSampleOrders('client-1'),
      }),
      queryClient.ensureQueryData({
        queryKey: ['samples', 'hero', 'client-1'],
        queryFn: () => repositories.samples.getHeroProducts('client-1'),
      }),
      queryClient.ensureQueryData({
        queryKey: ['samples', 'restocks', 'client-1'],
        queryFn: () => repositories.samples.getRestocks('client-1'),
      }),
    ]),
  component: SamplesPage,
})
