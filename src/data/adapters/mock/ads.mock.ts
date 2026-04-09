import type { AdsRepository } from '@/data/repositories/types'
import type { DateRange } from '@/modules/shared/types'
import adsData from '@/data/fixtures/ads-daily.json'
import type { AdsDailyMetric } from '@/modules/ads/types'

export function createMockAdsRepository(): AdsRepository {
  return {
    async getDailyMetrics(_clientId: string, range: DateRange): Promise<AdsDailyMetric[]> {
      const from = range.from.toISOString().split('T')[0]
      const to = range.to.toISOString().split('T')[0]
      return (adsData as AdsDailyMetric[]).filter(
        (m) => m.date >= from && m.date <= to,
      )
    },
  }
}
