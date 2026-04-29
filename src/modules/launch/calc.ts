import {
  MONTHS,
  AGENCY_COMMISSION_PCT,
  AGENCY_RETAINER_TTS,
  AGENCY_RETAINER_DTC,
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
    ttsPreRetainer[m] = ttsContribution[m] - ttsSampleCost[m] - inputs.tts.creatorIncentives[m]
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

  // cumulative investment: running sum of platformProfit while still negative;
  // once cum becomes non-negative (the launch breaks even), freeze output at 0
  // for all subsequent months — matches Excel template, where cells past the
  // inflection point are intentionally blank.
  let cum = 0
  let stillInvesting = true
  for (let m = 0; m < MONTHS; m++) {
    if (!stillInvesting) {
      ttsCumulativeInvest[m] = 0
      continue
    }
    cum += ttsPlatformProfit[m]
    if (cum >= 0) {
      ttsCumulativeInvest[m] = 0
      stillInvesting = false
    } else {
      ttsCumulativeInvest[m] = cum
    }
  }

  // ---- DTC ----
  const dtcGoogle = zeros(), dtcMeta = zeros(), dtcInc = zeros(), dtcOrders = zeros()
  const dtcCogs = zeros(), dtcShipping = zeros(), dtcProductMargin = zeros(), dtcPlatformProfit = zeros()

  for (let m = 0; m < MONTHS; m++) {
    dtcGoogle[m] = inputs.dtc.googleAdSpend[m] * inputs.dtc.googleRoas[m]
    dtcMeta[m] = inputs.dtc.metaAdSpend[m] * inputs.dtc.metaRoas[m]
    dtcInc[m] = dtcGoogle[m] + dtcMeta[m]
    dtcOrders[m] = shared.aov > 0 ? dtcInc[m] / shared.aov : 0
    dtcCogs[m] = dtcOrders[m] * cogsPerUnit
    dtcShipping[m] = dtcOrders[m] * shared.shippingPerUnit
    dtcProductMargin[m] = dtcInc[m] - dtcCogs[m] - dtcShipping[m]
    dtcPlatformProfit[m] = dtcProductMargin[m] - AGENCY_RETAINER_DTC
  }

  // ---- Amazon ----
  const amzRev = zeros(), amzOrders = zeros(), amzCogs = zeros(), amzShipping = zeros(), amzProductMargin = zeros()
  for (let m = 0; m < MONTHS; m++) {
    amzRev[m] = ttsGmv[m] * inputs.amazonMultiplierVsTts
    amzOrders[m] = shared.aov > 0 ? amzRev[m] / shared.aov : 0
    amzCogs[m] = amzOrders[m] * cogsPerUnit
    amzShipping[m] = amzOrders[m] * shared.shippingPerUnit
    amzProductMargin[m] = amzRev[m] - amzCogs[m] - amzShipping[m]
  }

  // ---- Net Profit ----
  // IMPORTANT: This sum is intentionally asymmetric. TTS contributes platformProfit
  // (post-retainer), but DTC contributes productMargin (PRE-retainer). The DTC
  // agency retainer is tracked in dtc.platformProfit for reporting but is
  // deliberately excluded from company-wide net profit, mirroring the Excel
  // template. Verified by the Conservative regression test reproducing
  // $955,132.33 within $1. Switching DTC to dtcPlatformProfit would shift the
  // total by MONTHS * AGENCY_RETAINER_DTC = $30,000.
  const netProfit = zeros()
  for (let m = 0; m < MONTHS; m++) {
    netProfit[m] = ttsPlatformProfit[m] + dtcProductMargin[m] + amzProductMargin[m]
  }

  return {
    tts: {
      gmv: ttsGmv, orders: ttsOrders, cogs: ttsCogs, shipping: ttsShipping,
      productMargin: ttsProductMargin, creatorCommission: ttsCreatorComm,
      platformFee: ttsPlatformFee, agencyCommission: ttsAgencyComm,
      contributionMargin: ttsContribution, contributionPct: ttsContributionPct,
      sampleCost: ttsSampleCost, platformProfit: ttsPlatformProfit,
      preRetainerProfit: ttsPreRetainer, cumulativeInvest: ttsCumulativeInvest,
      activeCreators, videos, videoViews, clicks,
    },
    dtc: {
      googleRevenue: dtcGoogle, metaRevenue: dtcMeta, incrementalRev: dtcInc, orders: dtcOrders,
      cogs: dtcCogs, shipping: dtcShipping, productMargin: dtcProductMargin, platformProfit: dtcPlatformProfit,
    },
    amazon: {
      revenue: amzRev, orders: amzOrders, cogs: amzCogs, shipping: amzShipping, productMargin: amzProductMargin,
    },
    netProfit,
    totals: {
      ttsGmv: sum(ttsGmv), ttsOrders: sum(ttsOrders),
      videos: sum(videos), videoViews: sum(videoViews), clicks: sum(clicks),
      dtcRevenue: sum(dtcInc), dtcOrders: sum(dtcOrders),
      amazonRevenue: sum(amzRev), amazonOrders: sum(amzOrders),
      netProfit: sum(netProfit),
    },
  }
}

export function computeAllScenarios(
  doc: LaunchScenario,
): Record<ScenarioKey, ScenarioOutputs> {
  return {
    conservative: computeScenario(doc.scenarios.conservative, doc.sharedInputs),
    balanced: computeScenario(doc.scenarios.balanced, doc.sharedInputs),
    aggressive: computeScenario(doc.scenarios.aggressive, doc.sharedInputs),
    rapid_scale: computeScenario(doc.scenarios.rapid_scale, doc.sharedInputs),
  }
}
