import { formatCurrency } from '@/lib/utils'
import type { AdsDailyMetric } from '@/modules/ads/types'

interface CollabsComparisonProps {
  data: AdsDailyMetric[]
}

function sumKey(data: AdsDailyMetric[], key: keyof AdsDailyMetric): number {
  return data.reduce((acc, d) => acc + (d[key] as number), 0)
}

export function CollabsComparison({ data }: CollabsComparisonProps) {
  const targetGmv = sumKey(data, 'targetCollabsGmv')
  const openGmv = sumKey(data, 'openCollabsGmv')
  const total = targetGmv + openGmv

  const targetPct = total > 0 ? targetGmv / total : 0
  const openPct = total > 0 ? openGmv / total : 0

  return (
    <div className="rounded-lg border border-border bg-card p-5 space-y-4">
      <h3 className="text-sm font-semibold text-card-foreground">Target vs Open Collaborations GMV</h3>

      <div className="flex gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: '#a78bfa' }} />
          <span className="text-muted">Target</span>
          <span className="font-medium text-card-foreground">{formatCurrency(targetGmv)}</span>
          <span className="text-muted">({(targetPct * 100).toFixed(1)}%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: '#60a5fa' }} />
          <span className="text-muted">Open</span>
          <span className="font-medium text-card-foreground">{formatCurrency(openGmv)}</span>
          <span className="text-muted">({(openPct * 100).toFixed(1)}%)</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex h-6 w-full overflow-hidden rounded-full bg-border">
          <div
            className="h-full transition-all"
            style={{ width: `${targetPct * 100}%`, backgroundColor: '#a78bfa' }}
          />
          <div
            className="h-full transition-all"
            style={{ width: `${openPct * 100}%`, backgroundColor: '#60a5fa' }}
          />
        </div>
        <div className="flex justify-between text-xs text-muted">
          <span>Target: {formatCurrency(targetGmv)}</span>
          <span>Total: {formatCurrency(total)}</span>
          <span>Open: {formatCurrency(openGmv)}</span>
        </div>
      </div>
    </div>
  )
}
