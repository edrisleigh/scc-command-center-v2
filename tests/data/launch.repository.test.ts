import { describe, it, expect, beforeEach } from 'vitest'
import { createMockLaunchRepository } from '@/data/adapters/mock/launch.mock'

describe('MockLaunchRepository', () => {
  let repo: ReturnType<typeof createMockLaunchRepository>
  beforeEach(() => { repo = createMockLaunchRepository() })

  it('lists scenarios for an org', async () => {
    const list = await repo.list('halo')
    expect(list.length).toBeGreaterThan(0)
    expect(list[0].orgSlug).toBe('halo')
  })

  it('returns null for unknown id', async () => {
    expect(await repo.getById('nope')).toBeNull()
  })

  it('returns the seeded HEYDUDE scenario by id', async () => {
    const s = await repo.getById('ls-heydude-q2-2026')
    expect(s?.prospectName).toBe('HEYDUDE')
    expect(s?.status).toBe('draft')
  })

  it('finds scenario by clientSlug', async () => {
    const s = await repo.getByClientSlug('halo', 'heydude')
    expect(s?.id).toBe('ls-heydude-q2-2026')
  })

  it('creates a new draft scenario with defaults', async () => {
    const created = await repo.create({ orgSlug: 'halo', prospectName: 'NewBrand', name: 'NewBrand Pitch' })
    expect(created.status).toBe('draft')
    expect(created.prospectName).toBe('NewBrand')
    expect(created.scenarios.conservative.tts.roas.length).toBe(6)
    const fetched = await repo.getById(created.id)
    expect(fetched?.id).toBe(created.id)
  })

  it('save() round-trips a scenario', async () => {
    const s = await repo.getById('ls-heydude-q2-2026')
    if (!s) throw new Error('seed missing')
    s.sharedInputs.aov = 120
    const saved = await repo.save(s)
    expect(saved.sharedInputs.aov).toBe(120)
    const fetched = await repo.getById(s.id)
    expect(fetched?.sharedInputs.aov).toBe(120)
  })

  it('lock() sets status, chosenScenarioKey, lockedAt', async () => {
    const created = await repo.create({ orgSlug: 'halo', prospectName: 'P', name: 'P' })
    const locked = await repo.lock(created.id, 'balanced')
    expect(locked.status).toBe('locked')
    expect(locked.chosenScenarioKey).toBe('balanced')
    expect(locked.lockedAt).not.toBeNull()
  })

  it('linkToClient() updates clientSlug', async () => {
    const created = await repo.create({ orgSlug: 'halo', prospectName: 'P', name: 'P' })
    const linked = await repo.linkToClient(created.id, 'lumen')
    expect(linked.clientSlug).toBe('lumen')
  })

  it('getById returns isolated copy — mutating the result does not leak into the store', async () => {
    const a = await repo.getById('ls-heydude-q2-2026')
    a!.sharedInputs.aov = 99999
    a!.scenarios.conservative.tts.roas[0] = 999
    const b = await repo.getById('ls-heydude-q2-2026')
    expect(b!.sharedInputs.aov).toBe(99.99)
    expect(b!.scenarios.conservative.tts.roas[0]).toBe(0.75)
  })
})
