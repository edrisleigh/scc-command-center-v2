import { describe, it, expect } from 'vitest'
import { createMockShopRepository } from '../shop.mock'
import { createMockVideoRepository } from '../video.mock'

const range = { from: new Date('2025-01-01'), to: new Date('2026-12-31') }

describe('shop adapter tenant scoping', () => {
  it('returns only rows for the requested clientId', async () => {
    const repo = createMockShopRepository()
    const heydude = await repo.getDailyMetrics('client-1', range)
    const unknown = await repo.getDailyMetrics('client-999', range)

    expect(heydude.length).toBeGreaterThan(0)
    expect(heydude.every((r) => r.clientId === 'client-1')).toBe(true)
    expect(unknown).toEqual([])
  })
})

describe('video adapter tenant scoping', () => {
  it('returns only rows for the requested clientId', async () => {
    const repo = createMockVideoRepository()
    const heydude = await repo.getDailyMetrics('client-1', range)
    const unknown = await repo.getDailyMetrics('client-999', range)

    expect(heydude.length).toBeGreaterThan(0)
    expect(heydude.every((r) => r.clientId === 'client-1')).toBe(true)
    expect(unknown).toEqual([])
  })
})
