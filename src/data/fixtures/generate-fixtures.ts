// TypeScript source for fixture generator.
// Run with: npx tsx src/data/fixtures/generate-fixtures.ts
// Or use the .mjs version directly: node src/data/fixtures/generate-fixtures.mjs

import { writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import type { ShopDailyMetric } from '@/modules/shop/types'
import type { VideoDailyMetric } from '@/modules/videos/types'
import type { AdsDailyMetric } from '@/modules/ads/types'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Seeded pseudo-random for reproducibility
let seed = 42
function rand(): number {
  seed = (seed * 1664525 + 1013904223) & 0xffffffff
  return (seed >>> 0) / 0xffffffff
}

function randBetween(min: number, max: number): number {
  return min + rand() * (max - min)
}

function roundTo(n: number, decimals = 2): number {
  return Math.round(n * Math.pow(10, decimals)) / Math.pow(10, decimals)
}

function getDates(start: string, end: string): string[] {
  const dates: string[] = []
  const cur = new Date(start)
  const endDate = new Date(end)
  while (cur <= endDate) {
    dates.push(cur.toISOString().split('T')[0])
    cur.setDate(cur.getDate() + 1)
  }
  return dates
}

const dates = getDates('2025-09-01', '2025-11-30')

// --- Shop daily fixtures ---
const shopDaily: ShopDailyMetric[] = dates.map((date) => {
  const dayOfWeek = new Date(date).getDay()
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
  const weekendBoost = isWeekend ? 1.25 : 1.0

  const gmv = roundTo(randBetween(140000, 220000) * weekendBoost)
  const grossRevenue = roundTo(gmv * randBetween(1.05, 1.15))
  const orders = Math.round(randBetween(800, 1600) * weekendBoost)
  const skuOrders = Math.round(orders * randBetween(1.1, 1.3))
  const itemsSold = Math.round(orders * randBetween(1.05, 1.25))
  const visitors = Math.round(randBetween(18000, 45000) * weekendBoost)
  const pageViews = Math.round(visitors * randBetween(2.5, 4.5))
  const customers = Math.round(orders * randBetween(0.85, 0.98))
  const conversionRate = roundTo((orders / visitors) * 100, 2)

  const liveGmvPct = randBetween(0.25, 0.40)
  const videoGmvPct = randBetween(0.20, 0.35)
  const productCardGmvPct = randBetween(0.15, 0.25)
  const liveGmv = roundTo(gmv * liveGmvPct)
  const videoGmv = roundTo(gmv * videoGmvPct)
  const productCardGmv = roundTo(gmv * productCardGmvPct)
  const affiliateGmv = roundTo(gmv - liveGmv - videoGmv - productCardGmv)

  const itemsRefunded = Math.round(itemsSold * randBetween(0.01, 0.04))
  const itemsCancelled = Math.round(itemsSold * randBetween(0.005, 0.02))
  const reviews = Math.round(orders * randBetween(0.05, 0.15))

  return {
    date,
    gmv,
    grossRevenue,
    itemsSold,
    customers,
    visitors,
    pageViews,
    skuOrders,
    orders,
    conversionRate,
    liveGmv,
    videoGmv,
    productCardGmv,
    affiliateGmv,
    itemsRefunded,
    itemsCancelled,
    reviews,
  }
})

// --- Video daily fixtures ---
const videoDaily: VideoDailyMetric[] = dates.map((date) => {
  const dayOfWeek = new Date(date).getDay()
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
  const weekendBoost = isWeekend ? 1.2 : 1.0

  const videoViews = Math.round(randBetween(1000000, 2500000) * weekendBoost)
  const videoProductViewers = Math.round(videoViews * randBetween(0.08, 0.18))
  const productImpressions = Math.round(videoProductViewers * randBetween(1.5, 3.0))
  const productClicks = Math.round(productImpressions * randBetween(0.03, 0.09))
  const ctr = roundTo((productClicks / productImpressions) * 100, 2)
  const skuOrders = Math.round(productClicks * randBetween(0.05, 0.15))
  const clickToOrderRate = roundTo((skuOrders / productClicks) * 100, 2)
  const customers = Math.round(skuOrders * randBetween(0.85, 0.98))
  const videoGmv = roundTo(randBetween(30000, 80000) * weekendBoost)
  const gpm = roundTo((videoGmv / videoViews) * 1000, 4)
  const shoppableVideoGmv = roundTo(videoGmv * randBetween(0.7, 0.9))
  const videosPosted = Math.round(randBetween(3, 15))

  return {
    date,
    videoGmv,
    videoViews,
    gpm,
    skuOrders,
    customers,
    videoProductViewers,
    productImpressions,
    productClicks,
    ctr,
    clickToOrderRate,
    shoppableVideoGmv,
    videosPosted,
  }
})

// --- Ads daily fixtures ---
const adsDaily: AdsDailyMetric[] = dates.map((date) => {
  const adSpend = roundTo(randBetween(3000, 10000))
  const roas = roundTo(randBetween(5, 20), 2)
  const adDrivenGmv = roundTo(adSpend * roas)
  const commissionRate = roundTo(randBetween(0.05, 0.12), 4)
  const affiliateGmv = roundTo(randBetween(20000, 60000))
  const commission = roundTo(affiliateGmv * commissionRate)
  const totalGmv = adDrivenGmv + affiliateGmv + randBetween(50000, 120000)
  const platformPctGmv = roundTo((adDrivenGmv / totalGmv) * 100, 2)
  const adsPctGmv = roundTo((adSpend / totalGmv) * 100, 2)
  const targetCollabsGmv = roundTo(affiliateGmv * randBetween(0.4, 0.7))
  const openCollabsGmv = roundTo(affiliateGmv - targetCollabsGmv)

  return {
    date,
    adDrivenGmv,
    adSpend,
    affiliateGmv,
    commission,
    commissionRate,
    platformPctGmv,
    adsPctGmv,
    roas,
    targetCollabsGmv,
    openCollabsGmv,
  }
})

writeFileSync(join(__dirname, 'shop-daily.json'), JSON.stringify(shopDaily, null, 2))
console.log(`Generated shop-daily.json: ${shopDaily.length} records`)

writeFileSync(join(__dirname, 'video-daily.json'), JSON.stringify(videoDaily, null, 2))
console.log(`Generated video-daily.json: ${videoDaily.length} records`)

writeFileSync(join(__dirname, 'ads-daily.json'), JSON.stringify(adsDaily, null, 2))
console.log(`Generated ads-daily.json: ${adsDaily.length} records`)
