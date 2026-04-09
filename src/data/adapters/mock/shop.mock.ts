import type { ShopRepository } from '@/data/repositories/types'
import type { DateRange } from '@/modules/shared/types'
import shopData from '@/data/fixtures/shop-daily.json'
import type { ShopDailyMetric } from '@/modules/shop/types'

export function createMockShopRepository(): ShopRepository {
  return {
    async getDailyMetrics(_clientId: string, range: DateRange): Promise<ShopDailyMetric[]> {
      const from = range.from.toISOString().split('T')[0]
      const to = range.to.toISOString().split('T')[0]
      return (shopData as ShopDailyMetric[]).filter(
        (m) => m.date >= from && m.date <= to,
      )
    },
  }
}
