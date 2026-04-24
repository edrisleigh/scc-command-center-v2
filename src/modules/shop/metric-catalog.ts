import type { ShopDailyMetric } from '@/modules/shop/types'

export type MetricFormat = 'currency' | 'number' | 'percent'
export type MetricAggregation = 'sum' | 'average'

export interface ShopMetricDefinition {
  key: keyof Omit<ShopDailyMetric, 'date'>
  label: string
  format: MetricFormat
  aggregation: MetricAggregation
}

export const SHOP_METRIC_CATALOG: ShopMetricDefinition[] = [
  { key: 'gmv', label: 'GMV', format: 'currency', aggregation: 'sum' },
  { key: 'grossRevenue', label: 'Gross Revenue', format: 'currency', aggregation: 'sum' },
  { key: 'orders', label: 'Orders', format: 'number', aggregation: 'sum' },
  { key: 'customers', label: 'Customers', format: 'number', aggregation: 'sum' },
  { key: 'visitors', label: 'Visitors', format: 'number', aggregation: 'sum' },
  { key: 'conversionRate', label: 'CVR', format: 'percent', aggregation: 'average' },
  { key: 'itemsSold', label: 'Items Sold', format: 'number', aggregation: 'sum' },
  { key: 'pageViews', label: 'Page Views', format: 'number', aggregation: 'sum' },
  { key: 'skuOrders', label: 'SKU Orders', format: 'number', aggregation: 'sum' },
  { key: 'liveGmv', label: 'LIVE GMV', format: 'currency', aggregation: 'sum' },
  { key: 'videoGmv', label: 'Video GMV', format: 'currency', aggregation: 'sum' },
  { key: 'productCardGmv', label: 'Product Card GMV', format: 'currency', aggregation: 'sum' },
  { key: 'affiliateGmv', label: 'Affiliate GMV', format: 'currency', aggregation: 'sum' },
  { key: 'itemsRefunded', label: 'Items Refunded', format: 'number', aggregation: 'sum' },
  { key: 'itemsCancelled', label: 'Items Cancelled', format: 'number', aggregation: 'sum' },
  { key: 'reviews', label: 'Reviews', format: 'number', aggregation: 'sum' },
]

export const DEFAULT_KPI_METRICS: Array<ShopMetricDefinition['key']> = [
  'gmv',
  'grossRevenue',
  'orders',
  'customers',
  'visitors',
  'conversionRate',
]

export interface ChartTabDefinition {
  key: 'revenue' | 'orders' | 'traffic' | 'channels'
  label: string
}

export const CHART_TAB_CATALOG: ChartTabDefinition[] = [
  { key: 'revenue', label: 'Revenue' },
  { key: 'orders', label: 'Orders' },
  { key: 'traffic', label: 'Traffic' },
  { key: 'channels', label: 'Channels' },
]

export const DEFAULT_CHART_TABS: Array<ChartTabDefinition['key']> = [
  'revenue',
  'orders',
  'traffic',
  'channels',
]

export interface ChannelSectionDefinition {
  key: 'gmv-by-channel' | 'affiliate-vs-open'
  label: string
}

export const CHANNEL_SECTION_CATALOG: ChannelSectionDefinition[] = [
  { key: 'gmv-by-channel', label: 'GMV by Channel' },
  { key: 'affiliate-vs-open', label: 'Affiliate vs Open Collaboration' },
]

export const DEFAULT_CHANNEL_SECTIONS: Array<ChannelSectionDefinition['key']> = [
  'gmv-by-channel',
  'affiliate-vs-open',
]

export function aggregate(
  data: ShopDailyMetric[],
  definition: ShopMetricDefinition,
): number {
  if (data.length === 0) return 0
  const values = data.map((d) => d[definition.key] as number)
  const total = values.reduce((acc, v) => acc + (v ?? 0), 0)
  return definition.aggregation === 'average' ? total / data.length : total
}

export function getMetricDefinition(
  key: ShopMetricDefinition['key'],
): ShopMetricDefinition | undefined {
  return SHOP_METRIC_CATALOG.find((m) => m.key === key)
}
