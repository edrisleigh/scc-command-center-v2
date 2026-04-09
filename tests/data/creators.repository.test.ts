import { describe, it, expect } from 'vitest'
import { createMockCreatorRepository } from '@/data/adapters/mock/creators.mock'

describe('MockCreatorRepository', () => {
  const repo = createMockCreatorRepository()

  it('returns an array of creators with correct fields', async () => {
    const creators = await repo.getCreators('client-1')
    expect(Array.isArray(creators)).toBe(true)
    expect(creators.length).toBeGreaterThan(0)

    const c = creators[0]
    expect(c).toHaveProperty('id')
    expect(c).toHaveProperty('username')
    expect(c).toHaveProperty('isVip')
    expect(c).toHaveProperty('isBrandPod')
    expect(c).toHaveProperty('samplesThisYear')
    expect(c).toHaveProperty('p28dAffiliateGmv')
    expect(c).toHaveProperty('deltaVsPriorPeriod')
    expect(c).toHaveProperty('affiliateLivePct')
    expect(c).toHaveProperty('affiliateProductsSold')
    expect(c).toHaveProperty('blendedCommissionRate')
    expect(c).toHaveProperty('avgOrderValue')
    expect(c).toHaveProperty('ctr')
    expect(c).toHaveProperty('productImpressions')
    expect(c).toHaveProperty('affiliateFollowers')
    expect(c).toHaveProperty('gpm')
    expect(c).toHaveProperty('gmvPerSample')

    expect(typeof c.id).toBe('string')
    expect(typeof c.username).toBe('string')
    expect(typeof c.isVip).toBe('boolean')
    expect(typeof c.p28dAffiliateGmv).toBe('number')
  })

  it('returns 25 creators', async () => {
    const creators = await repo.getCreators('client-1')
    expect(creators.length).toBe(25)
  })

  it('getCreatorById returns a matching creator', async () => {
    const creator = await repo.getCreatorById('client-1', 'creator-001')
    expect(creator).not.toBeNull()
    expect(creator?.id).toBe('creator-001')
    expect(creator?.username).toBe('sneakersteph')
  })

  it('getCreatorById returns null for unknown id', async () => {
    const creator = await repo.getCreatorById('client-1', 'creator-9999')
    expect(creator).toBeNull()
  })

  it('getLiveCreators returns live creators with level field', async () => {
    const liveCreators = await repo.getLiveCreators('client-1')
    expect(Array.isArray(liveCreators)).toBe(true)
    expect(liveCreators.length).toBeGreaterThan(0)

    const lc = liveCreators[0]
    expect(lc).toHaveProperty('level')
    expect(lc).toHaveProperty('liveExclusives')
    expect(lc).toHaveProperty('liveGmvP28d')
    expect(lc).toHaveProperty('affiliateLiveStreams')
    expect(['L1', 'L2', 'L3', 'L4', 'L5']).toContain(lc.level)
  })

  it('getTargetCollabs returns collabs with status field', async () => {
    const collabs = await repo.getTargetCollabs('client-1')
    expect(Array.isArray(collabs)).toBe(true)
    expect(collabs.length).toBeGreaterThan(0)

    const tc = collabs[0]
    expect(tc).toHaveProperty('id')
    expect(tc).toHaveProperty('creatorId')
    expect(tc).toHaveProperty('creatorUsername')
    expect(tc).toHaveProperty('status')
    expect(tc).toHaveProperty('product')
    expect(tc).toHaveProperty('notes')
    expect(['pending', 'in_progress', 'completed', 'declined']).toContain(tc.status)
  })

  it('getCollaborationData returns collaboration entries', async () => {
    const collabData = await repo.getCollaborationData('client-1')
    expect(Array.isArray(collabData)).toBe(true)
    expect(collabData.length).toBeGreaterThan(0)

    const cd = collabData[0]
    expect(cd).toHaveProperty('id')
    expect(cd).toHaveProperty('creatorId')
    expect(cd).toHaveProperty('type')
    expect(cd).toHaveProperty('gmv')
    expect(cd).toHaveProperty('period')
    expect(['target', 'open']).toContain(cd.type)
  })

  it('getCreatorIncentives returns incentive entries', async () => {
    const incentives = await repo.getCreatorIncentives('client-1')
    expect(Array.isArray(incentives)).toBe(true)
    expect(incentives.length).toBeGreaterThan(0)

    const inc = incentives[0]
    expect(inc).toHaveProperty('id')
    expect(inc).toHaveProperty('creatorId')
    expect(inc).toHaveProperty('type')
    expect(inc).toHaveProperty('amount')
    expect(inc).toHaveProperty('period')
    expect(typeof inc.amount).toBe('number')
  })
})
