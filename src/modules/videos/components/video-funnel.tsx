import { formatNumber, formatPercent } from '@/lib/utils'
import type { VideoDailyMetric } from '@/modules/videos/types'

interface VideoFunnelProps {
  data: VideoDailyMetric[]
}

function sumKey(data: VideoDailyMetric[], key: keyof VideoDailyMetric): number {
  return data.reduce((acc, d) => acc + (d[key] as number), 0)
}

interface FunnelStepProps {
  label: string
  value: number
  conversionRate?: number
  color: string
}

function FunnelStep({ label, value, conversionRate, color }: FunnelStepProps) {
  return (
    <div className="flex flex-col items-center">
      <div className="rounded-lg border border-border bg-card p-4 text-center w-full">
        <div className="text-xs uppercase tracking-wide text-muted mb-1">{label}</div>
        <div className="text-xl font-bold" style={{ color }}>{formatNumber(value)}</div>
      </div>
      {conversionRate !== undefined && (
        <div className="flex flex-col items-center py-2 text-xs text-muted">
          <svg className="h-4 w-4 mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          <span>{formatPercent(conversionRate)} conversion</span>
        </div>
      )}
    </div>
  )
}

export function VideoFunnel({ data }: VideoFunnelProps) {
  const productImpressions = sumKey(data, 'productImpressions')
  const productClicks = sumKey(data, 'productClicks')
  const skuOrders = sumKey(data, 'skuOrders')

  const impressionToClickRate = productImpressions > 0 ? productClicks / productImpressions : 0
  const clickToOrderRate = productClicks > 0 ? skuOrders / productClicks : 0

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <h3 className="text-sm font-semibold text-card-foreground mb-4">Conversion Funnel</h3>
      <div className="grid grid-cols-1 gap-0 md:grid-cols-5 md:gap-0 items-center">
        <div className="md:col-span-1">
          <FunnelStep
            label="Product Impressions"
            value={productImpressions}
            color="#a78bfa"
          />
        </div>
        <div className="md:col-span-1 flex justify-center">
          <div className="flex flex-col items-center py-2 text-xs text-muted">
            <svg className="h-4 w-4 mb-0.5 rotate-0 md:rotate-[-90deg]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span>{formatPercent(impressionToClickRate)}</span>
          </div>
        </div>
        <div className="md:col-span-1">
          <FunnelStep
            label="Product Clicks"
            value={productClicks}
            color="#60a5fa"
          />
        </div>
        <div className="md:col-span-1 flex justify-center">
          <div className="flex flex-col items-center py-2 text-xs text-muted">
            <svg className="h-4 w-4 mb-0.5 rotate-0 md:rotate-[-90deg]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            <span>{formatPercent(clickToOrderRate)}</span>
          </div>
        </div>
        <div className="md:col-span-1">
          <FunnelStep
            label="SKU Orders"
            value={skuOrders}
            color="#34d399"
          />
        </div>
      </div>
    </div>
  )
}
