import { createFileRoute } from '@tanstack/react-router'
import { SamplesPage } from '@/modules/samples/components/samples-page'
import { repositories } from '@/data'

export const Route = createFileRoute('/$orgSlug/$clientSlug/samples')({
  loader: ({ context: { queryClient, client } }) =>
    Promise.all([
      queryClient.ensureQueryData({
        queryKey: ['samples', 'products', client.id],
        queryFn: () => repositories.samples.getProducts(client.id),
      }),
      queryClient.ensureQueryData({
        queryKey: ['samples', 'orders', client.id],
        queryFn: () => repositories.samples.getSampleOrders(client.id),
      }),
      queryClient.ensureQueryData({
        queryKey: ['samples', 'hero', client.id],
        queryFn: () => repositories.samples.getHeroProducts(client.id),
      }),
      queryClient.ensureQueryData({
        queryKey: ['samples', 'restocks', client.id],
        queryFn: () => repositories.samples.getRestocks(client.id),
      }),
    ]),
  component: SamplesPage,
})
