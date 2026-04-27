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

describe('computeScenario - TTS active creators and videos', () => {
  it('month 1 active creators equals samplesPerMonth[0]', () => {
    const out = computeScenario(conservativeInputs, conservativeShared)
    expect(out.tts.activeCreators[0]).toBeCloseTo(200, 6)
  })

  it('month 2 active creators = (samples + prior) * 0.98', () => {
    const out = computeScenario(conservativeInputs, conservativeShared)
    // (200 + 200) * 0.98 = 392
    expect(out.tts.activeCreators[1]).toBeCloseTo(392, 6)
  })

  it('month 3 active creators compounds correctly', () => {
    const out = computeScenario(conservativeInputs, conservativeShared)
    // (200 + 392) * 0.98 = 580.16
    expect(out.tts.activeCreators[2]).toBeCloseTo(580.16, 6)
  })

  it('videos = activeCreators * videosPerCreator', () => {
    const out = computeScenario(conservativeInputs, conservativeShared)
    // M1: 200 * 3 = 600; M2: 392 * 2.4 = 940.8
    expect(out.tts.videos[0]).toBeCloseTo(600, 6)
    expect(out.tts.videos[1]).toBeCloseTo(940.8, 6)
  })

  it('videoViews and clicks scale linearly with videos', () => {
    const out = computeScenario(conservativeInputs, conservativeShared)
    expect(out.tts.videoViews[0]).toBeCloseTo(600 * 4993, 6)
    expect(out.tts.clicks[0]).toBeCloseTo(600 * 330, 6)
  })
})

describe('computeScenario - TTS margins and profit', () => {
  it('contributionMargin = productMargin - creatorComm - platformFee - agencyComm - adSpend', () => {
    const out = computeScenario(conservativeInputs, conservativeShared)
    // M1: gmv=17647.06, orders=176.49, cogs=176.49*19.998=3529.41, ship=176.49*7=1235.42
    // productMargin = 17647.06 - 3529.41 - 1235.42 = 12882.23
    // creatorComm = 17647.06 * 0.15 = 2647.06
    // platformFee = 17647.06 * 0.06 = 1058.82
    // agencyComm = 17647.06 * 0.05 = 882.35
    // contribution = 12882.23 - 2647.06 - 1058.82 - 882.35 - 20000 = -11706.00
    expect(out.tts.contributionMargin[0]).toBeCloseTo(-11706.0, 0)
  })

  it('platformProfit subtracts sample cost, creator incentives, and TTS retainer', () => {
    const out = computeScenario(conservativeInputs, conservativeShared)
    // M1: contribution -11706 - sampleCost(200*(19.998+7)=5399.6) - 5000 - 11900 = -34005.6
    expect(out.tts.platformProfit[0]).toBeCloseTo(-34005.6, 0)
  })
})
