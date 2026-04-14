import { createFileRoute } from '@tanstack/react-router'
import { ContentPage } from '@/modules/content/components/content-page'
import { repositories } from '@/data'

export const Route = createFileRoute('/$orgSlug/$clientSlug/content')({
  loader: ({ context: { queryClient } }) =>
    Promise.all([
      queryClient.ensureQueryData({
        queryKey: ['content', 'submissions', 'client-1'],
        queryFn: () => repositories.content.getContentSubmissions('client-1'),
      }),
      queryClient.ensureQueryData({
        queryKey: ['content', 'spark-codes', 'client-1'],
        queryFn: () => repositories.content.getSparkCodes('client-1'),
      }),
    ]),
  component: ContentPage,
})
