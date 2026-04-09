import { describe, it, expect } from 'vitest'
import { createMockVideoRepository } from '@/data/adapters/mock/video.mock'

describe('MockVideoRepository', () => {
  const repo = createMockVideoRepository()

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
    expect(m).toHaveProperty('videoGmv')
    expect(m).toHaveProperty('videoViews')
    expect(m).toHaveProperty('gpm')
    expect(m).toHaveProperty('skuOrders')
    expect(m).toHaveProperty('customers')
    expect(m).toHaveProperty('ctr')
    expect(m).toHaveProperty('clickToOrderRate')
    expect(m).toHaveProperty('shoppableVideoGmv')
    expect(typeof m.videoGmv).toBe('number')
    expect(typeof m.videoViews).toBe('number')
  })

  it('returns empty array for out-of-range dates', async () => {
    const metrics = await repo.getDailyMetrics('client-1', {
      from: new Date('2020-01-01'),
      to: new Date('2020-01-07'),
    })
    expect(metrics).toEqual([])
  })
})
