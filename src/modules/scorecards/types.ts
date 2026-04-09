export interface WeeklyScorecard {
  weekStarting: string
  weekEnding: string
  gmv: number
  grossRevenue: number
  orders: number
  customers: number
  visitors: number
  cvr: number
  adSpend: number
  roas: number
  videosPosted: number
  videoViews: number
  videoGpm: number
  liveGmvPct: number
  videoGmvPct: number
  affiliateGmvPct: number
}

export interface MonthlyScorecard {
  month: number
  year: number
  gmv: number
  growthVsPrevMonth: number
  grossRevenue: number
  aov: number
  asp: number
  liveGmvPct: number
  videoGmvPct: number
  productCardGmvPct: number
  affiliateGmvPct: number
  visitors: number
  cvr: number
  customers: number
  videosPosted: number
  videoViews: number
  videoGpm: number
}
