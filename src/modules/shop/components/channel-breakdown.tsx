import { formatCurrency } from '@/lib/utils'
import type { ShopDailyMetric } from '@/modules/shop/types'

interface ChannelBreakdownProps {
  data: ShopDailyMetric[]
}

function sumKey(data: ShopDailyMetric[], key: keyof ShopDailyMetric): number {
  return data.reduce((acc, d) => acc + (d[key] as number), 0)
}

interface ChannelBarProps {
  label: string
  amount: number
  pct: number
  color: string
}

function ChannelBar({ label, amount, pct, color }: ChannelBarProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-card-foreground">{label}</span>
        </div>
        <span className="text-card-foreground font-medium">{formatCurrency(amount)}</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct * 100}%`, backgroundColor: color }} />
      </div>
      <div className="text-right text-xs text-muted">{(pct * 100).toFixed(1)}%</div>
    </div>
  )
}

export function ChannelBreakdown({ data }: ChannelBreakdownProps) {
  const videoGmv = sumKey(data, 'videoGmv')
  const productCardGmv = sumKey(data, 'productCardGmv')
  const liveGmv = sumKey(data, 'liveGmv')
  const totalChannel = videoGmv + productCardGmv + liveGmv

  const affiliateGmv = sumKey(data, 'affiliateGmv')
  const totalGmv = sumKey(data, 'gmv')
  const nonAffiliateGmv = Math.max(0, totalGmv - affiliateGmv)

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-card-foreground">GMV by Channel</h3>
        <div className="space-y-3">
          <ChannelBar
            label="Video"
            amount={videoGmv}
            pct={totalChannel > 0 ? videoGmv / totalChannel : 0}
            color="#a78bfa"
          />
          <ChannelBar
            label="Product Card"
            amount={productCardGmv}
            pct={totalChannel > 0 ? productCardGmv / totalChannel : 0}
            color="#60a5fa"
          />
          <ChannelBar
            label="LIVE"
            amount={liveGmv}
            pct={totalChannel > 0 ? liveGmv / totalChannel : 0}
            color="#34d399"
          />
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card p-5 space-y-4">
        <h3 className="text-sm font-semibold text-card-foreground">Affiliate vs Non-Affiliate</h3>
        <div className="space-y-3">
          <ChannelBar
            label="Affiliate"
            amount={affiliateGmv}
            pct={totalGmv > 0 ? affiliateGmv / totalGmv : 0}
            color="#fbbf24"
          />
          <ChannelBar
            label="Non-Affiliate"
            amount={nonAffiliateGmv}
            pct={totalGmv > 0 ? nonAffiliateGmv / totalGmv : 0}
            color="#9ca3af"
          />
        </div>
      </div>
    </div>
  )
}
