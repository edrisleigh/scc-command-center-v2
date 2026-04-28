import type { SCENARIO_KEYS } from './constants'

export type ScenarioKey = typeof SCENARIO_KEYS[number]

export interface SharedInputs {
  aov: number
  cogsPercent: number
  shippingPerUnit: number
  creatorCommissionPct: number
  platformFeePct: number
}

export interface ScenarioInputs {
  tts: {
    roas: number[]              // length 6
    adSpend: number[]           // length 6
    adPctOfGmv: number[]        // length 6
    samplesPerMonth: number[]   // length 6 — drives sample cost AND active-creator growth
    videosPerCreator: number[]  // length 6
    creatorIncentives: number[] // length 6 — varies per scenario per month
  }
  dtc: {
    googleAdSpend: number[]
    metaAdSpend: number[]
    googleRoas: number[]
    metaRoas: number[]
  }
  amazonMultiplierVsTts: number
}

export interface LaunchScenario {
  id: string
  orgSlug: string
  clientSlug: string | null
  prospectName: string
  name: string
  status: 'draft' | 'locked'
  chosenScenarioKey: ScenarioKey | null
  sharedInputs: SharedInputs
  scenarios: Record<ScenarioKey, ScenarioInputs>
  createdAt: string
  updatedAt: string
  lockedAt: string | null
  lockedBy: string | null
}

export interface ScenarioOutputs {
  tts: {
    gmv: number[]
    orders: number[]
    cogs: number[]
    shipping: number[]
    productMargin: number[]
    creatorCommission: number[]
    platformFee: number[]
    agencyCommission: number[]
    contributionMargin: number[]
    contributionPct: number[]
    sampleCost: number[]
    platformProfit: number[]
    preRetainerProfit: number[]
    cumulativeInvest: number[]
    activeCreators: number[]
    videos: number[]
    videoViews: number[]
    clicks: number[]
  }
  dtc: {
    googleRevenue: number[]
    metaRevenue: number[]
    incrementalRev: number[]
    orders: number[]
    cogs: number[]
    shipping: number[]
    productMargin: number[]
    platformProfit: number[]
  }
  amazon: {
    revenue: number[]
    orders: number[]
    cogs: number[]
    shipping: number[]
    productMargin: number[]
  }
  netProfit: number[]
  totals: {
    ttsGmv: number
    ttsOrders: number
    videos: number
    videoViews: number
    clicks: number
    dtcRevenue: number
    dtcOrders: number
    amazonRevenue: number
    amazonOrders: number
    netProfit: number
  }
}
