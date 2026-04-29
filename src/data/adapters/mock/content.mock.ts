import type { ContentRepository } from '@/data/repositories/types'
import contentData from '@/data/fixtures/content.json'
import type { ContentSubmission, SparkCode } from '@/modules/content/types'

export function createMockContentRepository(): ContentRepository {
  return {
    async getContentSubmissions(clientId: string): Promise<ContentSubmission[]> {
      return (contentData.contentSubmissions as ContentSubmission[]).filter(
        (c) => c.clientId === clientId,
      )
    },
    async getSparkCodes(clientId: string): Promise<SparkCode[]> {
      return (contentData.sparkCodes as SparkCode[]).filter((c) => c.clientId === clientId)
    },
  }
}
