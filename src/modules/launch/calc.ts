import {
  MONTHS,
  AGENCY_COMMISSION_PCT,
  AGENCY_RETAINER_TTS,
  AGENCY_RETAINER_DTC,
  CREATOR_INCENTIVES,
  VIEWS_PER_VIDEO,
  CLICKS_PER_VIDEO,
  CREATOR_RETENTION_RATE,
} from './constants'
import type {
  LaunchScenario,
  ScenarioInputs,
  ScenarioOutputs,
  ScenarioKey,
  SharedInputs,
} from './types'

const zeros = () => Array.from({ length: MONTHS }, () => 0)

const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0)

export function computeScenario(
  inputs: ScenarioInputs,
  shared: SharedInputs,
): ScenarioOutputs {
  const cogsPerUnit = shared.aov * shared.cogsPercent

  // ---- TTS ----
  const ttsGmv = zeros()
  const ttsOrders = zeros()
  const ttsCogs = zeros()
  const ttsShipping = zeros()
  const ttsProductMargin = zeros()
  const ttsCreatorComm = zeros()
  const ttsPlatformFee = zeros()
  const ttsAgencyComm = zeros()
  const ttsContribution = zeros()
  const ttsContributionPct = zeros()
  const ttsSampleCost = zeros()
  const ttsPlatformProfit = zeros()
  const ttsPreRetainer = zeros()
  const ttsCumulativeInvest = zeros()
  const activeCreators = zeros()
  const videos = zeros()
  const videoViews = zeros()
  const clicks = zeros()

  for (let m = 0; m < MONTHS; m++) {
    const denom = inputs.tts.adPctOfGmv[m]
    ttsGmv[m] = denom === 0 ? 0 : (inputs.tts.adSpend[m] * inputs.tts.roas[m]) / denom
    ttsOrders[m] = shared.aov > 0 ? ttsGmv[m] / shared.aov : 0
    ttsCogs[m] = ttsOrders[m] * cogsPerUnit
    ttsShipping[m] = ttsOrders[m] * shared.shippingPerUnit
    ttsProductMargin[m] = ttsGmv[m] - ttsCogs[m] - ttsShipping[m]
    ttsCreatorComm[m] = ttsGmv[m] * shared.creatorCommissionPct
    ttsPlatformFee[m] = ttsGmv[m] * shared.platformFeePct
    ttsAgencyComm[m] = ttsGmv[m] * AGENCY_COMMISSION_PCT
    ttsContribution[m] =
      ttsProductMargin[m]
      - ttsCreatorComm[m]
      - ttsPlatformFee[m]
      - ttsAgencyComm[m]
      - inputs.tts.adSpend[m]
    ttsContributionPct[m] = ttsGmv[m] === 0 ? 0 : ttsContribution[m] / ttsGmv[m]
    ttsSampleCost[m] = inputs.tts.samplesPerMonth[m] * (cogsPerUnit + shared.shippingPerUnit)
    ttsPreRetainer[m] = ttsContribution[m] - ttsSampleCost[m] - CREATOR_INCENTIVES
    ttsPlatformProfit[m] = ttsPreRetainer[m] - AGENCY_RETAINER_TTS

    if (m === 0) {
      activeCreators[m] = inputs.tts.samplesPerMonth[m]
    } else {
      activeCreators[m] =
        (inputs.tts.samplesPerMonth[m] + activeCreators[m - 1]) * CREATOR_RETENTION_RATE
    }
    videos[m] = activeCreators[m] * inputs.tts.videosPerCreator[m]
    videoViews[m] = videos[m] * VIEWS_PER_VIDEO
    clicks[m] = videos[m] * CLICKS_PER_VIDEO
  }

  // cumulative investment: running sum of profits while still negative
  let cum = 0
  for (let m = 0; m < MONTHS; m++) {
    if (cum + ttsPlatformProfit[m] < 0) {
      cum += ttsPlatformProfit[m]
      ttsCumulativeInvest[m] = cum
    } else {
      ttsCumulativeInvest[m] = 0
    }
  }

  return {
    tts: {
      gmv: ttsGmv,
      orders: ttsOrders,
      cogs: ttsCogs,
      shipping: ttsShipping,
      productMargin: ttsProductMargin,
      creatorCommission: ttsCreatorComm,
      platformFee: ttsPlatformFee,
      agencyCommission: ttsAgencyComm,
      contributionMargin: ttsContribution,
      contributionPct: ttsContributionPct,
      sampleCost: ttsSampleCost,
      platformProfit: ttsPlatformProfit,
      preRetainerProfit: ttsPreRetainer,
      cumulativeInvest: ttsCumulativeInvest,
      activeCreators,
      videos,
      videoViews,
      clicks,
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
      ttsGmv: sum(ttsGmv),
      ttsOrders: sum(ttsOrders),
      videos: sum(videos),
      videoViews: sum(videoViews),
      clicks: sum(clicks),
      dtcRevenue: 0,
      dtcOrders: 0,
      amazonRevenue: 0,
      amazonOrders: 0,
      netProfit: 0,
    },
  }
}
