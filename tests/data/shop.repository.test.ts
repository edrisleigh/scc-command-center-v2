import { describe, it, expect } from 'vitest'
import { createMockShopRepository } from '@/data/adapters/mock/shop.mock'

describe('MockShopRepository', () => {
  const repo = createMockShopRepository()

  it('returns daily metrics within date range', async () => {
    const metrics = await repo.getDailyMetrics('client-1', {
      from: new Date('2025-10-01'),
      to: new Date('2025-10-07'),
    })
    expect(metrics.length).toBe(7)
    expect(metrics[0].date).toBe('2025-10-01')
    expect(metrics[6].date).toBe('2025-10-07')
  })

  it('returns metrics with all required fields', async () => {
    const metrics = await repo.getDailyMetrics('client-1', {
      from: new Date('2025-10-01'),
      to: new Date('2025-10-01'),
    })
    const m = metrics[0]
    expect(m).toHaveProperty('gmv')
    expect(m).toHaveProperty('grossRevenue')
    expect(m).toHaveProperty('customers')
    expect(m).toHaveProperty('conversionRate')
    expect(m).toHaveProperty('liveGmv')
    expect(m).toHaveProperty('videoGmv')
    expect(m).toHaveProperty('productCardGmv')
    expect(m).toHaveProperty('affiliateGmv')
    expect(typeof m.gmv).toBe('number')
  })

  it('returns empty array for out-of-range dates', async () => {
    const metrics = await repo.getDailyMetrics('client-1', {
      from: new Date('2020-01-01'),
      to: new Date('2020-01-07'),
    })
    expect(metrics).toEqual([])
  })
})
