import { describe, it, expect } from 'vitest'
import { computeScenario } from '@/modules/launch/calc'
import type { ScenarioInputs, SharedInputs, ScenarioKey } from '@/modules/launch/types'

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

describe('computeScenario - cumulative investment freezes after break-even', () => {
  it('writes 0 for all months after the running sum crosses positive, even if later months would have been negative', () => {
    // Construct a fixture where TTS platform profit is -10000, -5000, +20000, -3000, +5000, +5000.
    // Cumulative running sum before clipping: -10K, -15K, +5K, +2K, +7K, +12K.
    // The inflection happens at M3. After M3, cumulativeInvest must be 0 — including M4 (which has a negative profit).
    // The buggy version would write a fictional cumulative for M4 by re-referencing the M2 value.

    // With roas=1.5, adSpend=10000, adPctOfGmv=1, all cost pcts=0:
    //   gmv = 15000, agencyComm = 750, contribution = 15000 - 750 - 10000 = 4250
    //   preRetainer = 4250 - 5000 = -750, platformProfit = -750 - 11900 = -12650 (negative)
    // With roas=5.0, adSpend=50000, adPctOfGmv=1, all cost pcts=0:
    //   gmv = 250000, agencyComm = 12500, contribution = 250000 - 12500 - 50000 = 187500
    //   preRetainer = 187500 - 5000 = 182500, platformProfit = 182500 - 11900 = 170600 (positive)
    // platformProfit array: [-12650, -12650, +170600, -12650, +170600, +170600]
    // Running cumulative:   -12650, -25300, +145300, ...
    // Inflection at M3 (index 2). M4 (index 3) has negative profit but must still read 0.
    const shared: SharedInputs = {
      aov: 100,
      cogsPercent: 0,
      shippingPerUnit: 0,
      creatorCommissionPct: 0,
      platformFeePct: 0,
    }
    const inputs: ScenarioInputs = {
      tts: {
        roas:            [1.5, 1.5, 5.0, 1.5, 5.0, 5.0],
        adSpend:         [10000, 10000, 50000, 10000, 50000, 50000],
        adPctOfGmv:      [1, 1, 1, 1, 1, 1],
        samplesPerMonth: [0, 0, 0, 0, 0, 0],
        videosPerCreator:[1, 1, 1, 1, 1, 1],
      },
      dtc: {
        googleAdSpend: [0, 0, 0, 0, 0, 0],
        metaAdSpend:   [0, 0, 0, 0, 0, 0],
        googleRoas:    [0, 0, 0, 0, 0, 0],
        metaRoas:      [0, 0, 0, 0, 0, 0],
      },
      amazonMultiplierVsTts: 0,
    }

    const out = computeScenario(inputs, shared)

    // Find the first month where running sum crosses to non-negative.
    let runningSum = 0
    let crossedAt = -1
    for (let i = 0; i < out.tts.platformProfit.length; i++) {
      runningSum += out.tts.platformProfit[i]
      if (runningSum >= 0 && crossedAt === -1) {
        crossedAt = i
      }
    }
    expect(crossedAt).toBeGreaterThan(-1) // sanity: this scenario does cross

    // At least one month before the inflection should be negative
    expect(out.tts.cumulativeInvest[0]).toBeLessThan(0)

    // All months at or after crossedAt must read 0
    for (let i = crossedAt; i < out.tts.cumulativeInvest.length; i++) {
      expect(out.tts.cumulativeInvest[i]).toBe(0)
    }
  })
})

describe('computeScenario - DTC', () => {
  it('googleRevenue = googleAdSpend * googleRoas', () => {
    const out = computeScenario(conservativeInputs, conservativeShared)
    // M1: 50000 * 0.4 = 20000
    expect(out.dtc.googleRevenue[0]).toBeCloseTo(20000, 6)
  })

  it('incrementalRev = google + meta', () => {
    const out = computeScenario(conservativeInputs, conservativeShared)
    // M1: 20000 + (100000 * 0.2)=20000 → 40000
    expect(out.dtc.incrementalRev[0]).toBeCloseTo(40000, 6)
  })

  it('platformProfit subtracts AGENCY_RETAINER_DTC', () => {
    const out = computeScenario(conservativeInputs, conservativeShared)
    // M1 incrementalRev=40000, orders=400.04, cogs=400.04*19.998=8000, ship=400.04*7=2800.28
    // productMargin = 40000 - 8000 - 2800.28 = 29199.72; profit = 29199.72 - 5000 = 24199.72
    expect(out.dtc.platformProfit[0]).toBeCloseTo(24199.72, 0)
  })
})

describe('computeScenario - Amazon', () => {
  it('revenue = ttsGmv * amazonMultiplier', () => {
    const out = computeScenario(conservativeInputs, conservativeShared)
    // M1: 17647.06 * 0.30 = 5294.12
    expect(out.amazon.revenue[0]).toBeCloseTo(5294.12, 1)
  })
})

describe('computeScenario - net profit and totals (Conservative)', () => {
  it('reproduces Excel 6-month TTS GMV total', () => {
    const out = computeScenario(conservativeInputs, conservativeShared)
    expect(out.totals.ttsGmv).toBeCloseTo(960037.02, 0)
  })

  it('reproduces Excel 6-month TTS orders total', () => {
    const out = computeScenario(conservativeInputs, conservativeShared)
    expect(out.totals.ttsOrders).toBeCloseTo(9601.33, 1)
  })

  it('reproduces Excel 6-month videos total', () => {
    const out = computeScenario(conservativeInputs, conservativeShared)
    expect(out.totals.videos).toBeCloseTo(11777.83, 1)
  })

  it('reproduces Excel 6-month video views (within 1%)', () => {
    const out = computeScenario(conservativeInputs, conservativeShared)
    const expected = 58_806_697
    const tolerance = expected * 0.01
    expect(Math.abs(out.totals.videoViews - expected)).toBeLessThan(tolerance)
  })

  it('reproduces Excel 6-month DTC revenue total', () => {
    const out = computeScenario(conservativeInputs, conservativeShared)
    expect(out.totals.dtcRevenue).toBeCloseTo(976000, 0)
  })

  it('reproduces Excel 6-month Amazon revenue total', () => {
    const out = computeScenario(conservativeInputs, conservativeShared)
    expect(out.totals.amazonRevenue).toBeCloseTo(288011.10, 1)
  })

  it('reproduces Excel 6-month NET PROFIT (Conservative)', () => {
    const out = computeScenario(conservativeInputs, conservativeShared)
    expect(out.totals.netProfit).toBeCloseTo(955132.33, 0)
  })
})

describe('computeScenario - edge cases', () => {
  it('does not crash with all-zero inputs', () => {
    const zeros6 = [0, 0, 0, 0, 0, 0]
    const inputs: ScenarioInputs = {
      tts: {
        roas: zeros6, adSpend: zeros6, adPctOfGmv: [1, 1, 1, 1, 1, 1],
        samplesPerMonth: zeros6, videosPerCreator: zeros6,
      },
      dtc: { googleAdSpend: zeros6, metaAdSpend: zeros6, googleRoas: zeros6, metaRoas: zeros6 },
      amazonMultiplierVsTts: 0,
    }
    const out = computeScenario(inputs, conservativeShared)
    expect(out.totals.ttsGmv).toBe(0)
    expect(Number.isFinite(out.totals.netProfit)).toBe(true)
  })

  it('handles adPctOfGmv = 0 without dividing by zero', () => {
    const inputs: ScenarioInputs = {
      ...conservativeInputs,
      tts: { ...conservativeInputs.tts, adPctOfGmv: [0, 0.8, 0.75, 0.72, 0.7, 0.65] },
    }
    const out = computeScenario(inputs, conservativeShared)
    expect(out.tts.gmv[0]).toBe(0)
    expect(Number.isFinite(out.tts.gmv[1])).toBe(true)
  })
})
