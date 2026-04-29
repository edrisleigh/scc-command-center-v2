import { describe, it, expect } from 'vitest'
import { createMockShopRepository } from '../shop.mock'
import { createMockVideoRepository } from '../video.mock'
import { createMockAdsRepository } from '../ads.mock'
import { createMockCreatorRepository } from '../creators.mock'
import { createMockContentRepository } from '../content.mock'
import { createMockSamplesRepository } from '../samples.mock'
import { createMockScorecardsRepository } from '../scorecards.mock'

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

describe('ads adapter tenant scoping', () => {
  it('returns only rows for the requested clientId', async () => {
    const repo = createMockAdsRepository()
    const heydude = await repo.getDailyMetrics('client-1', range)
    const unknown = await repo.getDailyMetrics('client-999', range)
    expect(heydude.length).toBeGreaterThan(0)
    expect(heydude.every((r) => r.clientId === 'client-1')).toBe(true)
    expect(unknown).toEqual([])
  })
})

describe('creators adapter tenant scoping', () => {
  it('returns only creators/live/collabs/etc. for the requested clientId', async () => {
    const repo = createMockCreatorRepository()

    expect((await repo.getCreators('client-1')).length).toBeGreaterThan(0)
    expect(await repo.getCreators('client-999')).toEqual([])
    expect(await repo.getLiveCreators('client-999')).toEqual([])
    expect(await repo.getTargetCollabs('client-999')).toEqual([])
    expect(await repo.getCollaborationData('client-999')).toEqual([])
    expect(await repo.getCreatorIncentives('client-999')).toEqual([])
  })
})

describe('content adapter tenant scoping', () => {
  it('returns only submissions/spark codes for the requested clientId', async () => {
    const repo = createMockContentRepository()
    expect((await repo.getContentSubmissions('client-1')).length).toBeGreaterThan(0)
    expect(await repo.getContentSubmissions('client-999')).toEqual([])
    expect(await repo.getSparkCodes('client-999')).toEqual([])
  })
})

describe('samples adapter tenant scoping', () => {
  it('filters every getter by clientId', async () => {
    const repo = createMockSamplesRepository()
    expect((await repo.getProducts('client-1')).length).toBeGreaterThan(0)
    expect(await repo.getProducts('client-999')).toEqual([])
    expect(await repo.getSampleOrders('client-999')).toEqual([])
    expect(await repo.getHeroProducts('client-999')).toEqual([])
    expect(await repo.getRestocks('client-999')).toEqual([])
  })
})

describe('scorecards adapter tenant scoping', () => {
  it('filters weekly and monthly by clientId', async () => {
    const repo = createMockScorecardsRepository()
    expect((await repo.getWeeklyScorecard('client-1')).length).toBeGreaterThan(0)
    expect(await repo.getWeeklyScorecard('client-999')).toEqual([])
    expect(await repo.getMonthlyScorecard('client-999')).toEqual([])
  })
})
