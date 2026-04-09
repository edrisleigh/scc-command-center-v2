import type { VideoRepository } from '@/data/repositories/types'
import type { DateRange } from '@/modules/shared/types'
import videoData from '@/data/fixtures/video-daily.json'
import type { VideoDailyMetric } from '@/modules/videos/types'

export function createMockVideoRepository(): VideoRepository {
  return {
    async getDailyMetrics(_clientId: string, range: DateRange): Promise<VideoDailyMetric[]> {
      const from = range.from.toISOString().split('T')[0]
      const to = range.to.toISOString().split('T')[0]
      return (videoData as VideoDailyMetric[]).filter(
        (m) => m.date >= from && m.date <= to,
      )
    },
  }
}
