export interface Creator {
  id: string
  username: string
  isVip: boolean
  isBrandPod: boolean
  samplesThisYear: number
  p28dAffiliateGmv: number
  deltaVsPriorPeriod: number
  affiliateLivePct: number
  affiliateProductsSold: number
  blendedCommissionRate: number
  avgOrderValue: number
  ctr: number
  productImpressions: number
  affiliateFollowers: number
  gpm: number
  gmvPerSample: number
}

export interface LiveCreator extends Creator {
  level: 'L1' | 'L2' | 'L3' | 'L4' | 'L5'
  liveExclusives: boolean
  interestedBrandHandleLives: boolean
  liveGmvP28d: number
  liveGrowth: number
  liveGrowthPct: number
  affiliateLiveStreams: number
}

export interface TargetCollab {
  id: string
  creatorId: string
  creatorUsername: string
  status: 'pending' | 'in_progress' | 'completed' | 'declined'
  product: string
  notes: string
}

export interface CollaborationData {
  id: string
  creatorId: string
  creatorUsername: string
  type: 'target' | 'open'
  gmv: number
  period: string
}

export interface CreatorIncentive {
  id: string
  creatorId: string
  creatorUsername: string
  type: string
  amount: number
  period: string
}
