import { describe, it, expect } from 'vitest'
import { createMockAdsRepository } from '@/data/adapters/mock/ads.mock'

describe('MockAdsRepository', () => {
  const repo = createMockAdsRepository()

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
    expect(m).toHaveProperty('adDrivenGmv')
    expect(m).toHaveProperty('adSpend')
    expect(m).toHaveProperty('affiliateGmv')
    expect(m).toHaveProperty('commission')
    expect(m).toHaveProperty('commissionRate')
    expect(m).toHaveProperty('roas')
    expect(m).toHaveProperty('targetCollabsGmv')
    expect(m).toHaveProperty('openCollabsGmv')
    expect(typeof m.adSpend).toBe('number')
    expect(typeof m.roas).toBe('number')
  })

  it('returns empty array for out-of-range dates', async () => {
    const metrics = await repo.getDailyMetrics('client-1', {
      from: new Date('2020-01-01'),
      to: new Date('2020-01-07'),
    })
    expect(metrics).toEqual([])
  })
})
