import { MONTHS } from './constants'
import type { ScenarioInputs, SharedInputs, ScenarioOutputs } from './types'

const zeros = () => Array.from({ length: MONTHS }, () => 0)

export function computeScenario(
  inputs: ScenarioInputs,
  shared: SharedInputs,
): ScenarioOutputs {
  const ttsGmv = zeros()
  const ttsOrders = zeros()

  for (let m = 0; m < MONTHS; m++) {
    const denom = inputs.tts.adPctOfGmv[m]
    ttsGmv[m] = denom === 0 ? 0 : (inputs.tts.adSpend[m] * inputs.tts.roas[m]) / denom
    ttsOrders[m] = shared.aov > 0 ? ttsGmv[m] / shared.aov : 0
  }

  // Stub fields — filled in subsequent tasks
  return {
    tts: {
      gmv: ttsGmv,
      orders: ttsOrders,
      cogs: zeros(),
      shipping: zeros(),
      productMargin: zeros(),
      creatorCommission: zeros(),
      platformFee: zeros(),
      agencyCommission: zeros(),
      contributionMargin: zeros(),
      contributionPct: zeros(),
      sampleCost: zeros(),
      platformProfit: zeros(),
      preRetainerProfit: zeros(),
      cumulativeInvest: zeros(),
      activeCreators: zeros(),
      videos: zeros(),
      videoViews: zeros(),
      clicks: zeros(),
    },
    dtc: {
      googleRevenue: zeros(),
      metaRevenue: zeros(),
      incrementalRev: zeros(),
      orders: zeros(),
      cogs: zeros(),
      shipping: zeros(),
      productMargin: zeros(),
      platformProfit: zeros(),
    },
    amazon: {
      revenue: zeros(),
      orders: zeros(),
      cogs: zeros(),
      shipping: zeros(),
      productMargin: zeros(),
    },
    netProfit: zeros(),
    totals: {
      ttsGmv: 0,
      ttsOrders: 0,
      videos: 0,
      videoViews: 0,
      clicks: 0,
      dtcRevenue: 0,
      dtcOrders: 0,
      amazonRevenue: 0,
      amazonOrders: 0,
      netProfit: 0,
    },
  }
}
