import { describe, it, expect } from 'vitest'
import { computeScenario } from '@/modules/launch/calc'
import type { ScenarioInputs, SharedInputs } from '@/modules/launch/types'

const conservativeShared: SharedInputs = {
  aov: 99.99,
  cogsPercent: 0.20,
  shippingPerUnit: 7.0,
  creatorCommissionPct: 0.15,
  platformFeePct: 0.06,
}

const conservativeInputs: ScenarioInputs = {
  tts: {
    roas: [0.75, 1.5, 1.95, 2.5, 2.8, 3.0],
    adSpend: [20000, 35000, 45000, 50000, 60000, 75000],
    adPctOfGmv: [0.85, 0.8, 0.75, 0.72, 0.7, 0.65],
    samplesPerMonth: [200, 200, 200, 200, 200, 200],
    videosPerCreator: [3, 2.4, 3, 3, 3, 3],
  },
  dtc: {
    googleAdSpend: [50000, 50000, 50000, 50000, 50000, 50000],
    metaAdSpend: [100000, 100000, 100000, 100000, 100000, 100000],
    googleRoas: [0.4, 0.78, 0.91, 1.3, 1.43, 1.56],
    metaRoas: [0.2, 0.65, 0.91, 1.3, 1.56, 1.95],
  },
  amazonMultiplierVsTts: 0.30,
}

describe('computeScenario - TTS GMV and orders', () => {
  it('computes month 1 TTS GMV via (adSpend * roas) / adPctOfGmv', () => {
    const out = computeScenario(conservativeInputs, conservativeShared)
    // (20000 * 0.75) / 0.85 = 17647.0588...
    expect(out.tts.gmv[0]).toBeCloseTo(17647.0588, 2)
  })

  it('computes month 6 TTS GMV', () => {
    const out = computeScenario(conservativeInputs, conservativeShared)
    // (75000 * 3.0) / 0.65 = 346153.846...
    expect(out.tts.gmv[5]).toBeCloseTo(346153.846, 2)
  })

  it('computes orders as gmv / aov', () => {
    const out = computeScenario(conservativeInputs, conservativeShared)
    expect(out.tts.orders[0]).toBeCloseTo(17647.0588 / 99.99, 2)
  })
})
