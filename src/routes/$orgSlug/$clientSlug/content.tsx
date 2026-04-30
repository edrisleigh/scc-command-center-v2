import { createFileRoute } from '@tanstack/react-router'
import { ContentPage } from '@/modules/content/components/content-page'
import { repositories } from '@/data'

export const Route = createFileRoute('/$orgSlug/$clientSlug/content')({
  loader: ({ context: { queryClient, client } }) =>
    Promise.all([
      queryClient.ensureQueryData({
        queryKey: ['content', 'submissions', client.id],
        queryFn: () => repositories.content.getContentSubmissions(client.id),
      }),
      queryClient.ensureQueryData({
        queryKey: ['content', 'spark-codes', client.id],
        queryFn: () => repositories.content.getSparkCodes(client.id),
      }),
    ]),
  component: ContentPage,
})
