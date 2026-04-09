import { useQuery } from '@tanstack/react-query'
import { repositories } from '@/data'

export function useContentSubmissions(clientId: string) {
  return useQuery({
    queryKey: ['content', 'submissions', clientId],
    queryFn: () => repositories.content.getContentSubmissions(clientId),
  })
}

export function useSparkCodes(clientId: string) {
  return useQuery({
    queryKey: ['content', 'spark-codes', clientId],
    queryFn: () => repositories.content.getSparkCodes(clientId),
  })
}
