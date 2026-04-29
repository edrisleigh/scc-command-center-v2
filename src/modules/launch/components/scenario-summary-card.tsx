import { Star } from 'lucide-react'
import type { ScenarioOutputs, ScenarioKey } from '@/modules/launch/types'
import { SCENARIO_LABELS } from '@/modules/launch/constants'
import { formatCurrency, formatNumber, formatPercent, cn } from '@/lib/utils'

interface ScenarioSummaryCardProps {
  scenarioKey: ScenarioKey
  outputs: ScenarioOutputs
  isChosen: boolean
  contributionPctTotal: number
  onEdit?: () => void
  onPick?: () => void
}

export function ScenarioSummaryCard({
  scenarioKey,
  outputs,
  isChosen,
  contributionPctTotal,
  onEdit,
  onPick,
}: ScenarioSummaryCardProps) {
  const showActions = !!(onEdit || onPick)
  return (
    <div
      className={cn(
        'relative rounded-xl border bg-card p-4 flex flex-col gap-3',
        isChosen ? 'border-success bg-success/5' : 'border-border',
      )}
    >
      {isChosen && (
        <span className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-success">
          <Star className="h-3 w-3" /> chosen
        </span>
      )}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-card-foreground">{SCENARIO_LABELS[scenarioKey]}</h3>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Kpi label="GMV" value={formatCurrency(outputs.totals.ttsGmv)} />
        <Kpi label="Orders" value={formatNumber(outputs.totals.ttsOrders)} />
        <Kpi label="Net profit" value={formatCurrency(outputs.totals.netProfit)} highlight />
        <Kpi label="CM%" value={formatPercent(contributionPctTotal)} />
      </div>
      <Sparkline values={outputs.netProfit} />
      {showActions && (
        <div className="flex gap-2 mt-1">
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex-1 rounded-md border border-border bg-accent/40 px-2 py-1.5 text-xs hover:bg-accent"
            >
              Edit
            </button>
          )}
          {onPick && (
            <button
              onClick={onPick}
              className={cn(
                'flex-1 rounded-md px-2 py-1.5 text-xs font-medium',
                isChosen
                  ? 'border border-success/40 bg-success/15 text-success'
                  : 'border border-primary/40 bg-primary/15 text-primary hover:bg-primary/25',
              )}
            >
              {isChosen ? '★ Picked' : 'Pick'}
            </button>
          )}
        </div>
      )}
    </div>
  )
}

function Kpi({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wide text-muted">{label}</div>
      <div className={cn('mt-0.5 text-base font-semibold', highlight ? 'text-success' : 'text-card-foreground')}>
        {value}
      </div>
    </div>
  )
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length === 0) return <div className="h-6" />
  const min = Math.min(...values, 0)
  const max = Math.max(...values, 0)
  const range = max - min || 1
  const points = values
    .map((v, i) => `${(i / (values.length - 1)) * 100},${100 - ((v - min) / range) * 100}`)
    .join(' ')
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-8 w-full text-success">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="2" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}
