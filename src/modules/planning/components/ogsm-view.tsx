import { cn, formatCurrency, formatPercent, formatNumber } from '@/lib/utils'
import type { PlanningPeriod, PlanningMetrics } from '@/modules/planning/types'

interface OgsmViewProps {
  periods: PlanningPeriod[]
}

interface MetricRow {
  key: keyof PlanningMetrics
  label: string
  format: (v: number) => string
  higherIsBetter: boolean
}

const metricRows: MetricRow[] = [
  { key: 'gmv', label: 'GMV', format: formatCurrency, higherIsBetter: true },
  { key: 'cos', label: 'COS', format: formatPercent, higherIsBetter: false },
  { key: 'adSpend', label: 'Ad Spend', format: formatCurrency, higherIsBetter: true },
  { key: 'samples', label: 'Samples', format: formatNumber, higherIsBetter: true },
  { key: 'videosPosted', label: 'Videos Posted', format: formatNumber, higherIsBetter: true },
  { key: 'roas', label: 'ROAS', format: (v) => `${v.toFixed(1)}x`, higherIsBetter: true },
]

function getProgressColor(pct: number, higherIsBetter: boolean): string {
  const score = higherIsBetter ? pct : (2 - pct) // invert for lower-is-better metrics
  if (score >= 0.9) return 'bg-emerald-500'
  if (score >= 0.7) return 'bg-amber-500'
  return 'bg-red-500'
}

function getTextColor(pct: number, higherIsBetter: boolean): string {
  const score = higherIsBetter ? pct : (2 - pct)
  if (score >= 0.9) return 'text-emerald-400'
  if (score >= 0.7) return 'text-amber-400'
  return 'text-red-400'
}

interface MetricBarProps {
  row: MetricRow
  target: number
  actual: number
}

function MetricBar({ row, target, actual }: MetricBarProps) {
  const pct = target > 0 ? actual / target : 0
  const clampedPct = Math.min(pct, 1)
  const displayPct = Math.round(pct * 100)
  const barColor = getProgressColor(pct, row.higherIsBetter)
  const textColor = getTextColor(pct, row.higherIsBetter)

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-muted-foreground">{row.label}</span>
        <span className={cn('font-semibold tabular-nums', textColor)}>
          {displayPct}%
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-border">
        <div
          className={cn('h-1.5 rounded-full transition-all', barColor)}
          style={{ width: `${clampedPct * 100}%` }}
        />
      </div>
      <div className="flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Target: {row.format(target)}</span>
        <span>Actual: {row.format(actual)}</span>
      </div>
    </div>
  )
}

function getQuarterStatus(period: PlanningPeriod): { label: string; className: string } {
  const gmvPct = period.actuals.gmv / period.targets.gmv
  if (gmvPct >= 1.0) return { label: 'Exceeded', className: 'bg-emerald-500/15 text-emerald-400' }
  if (gmvPct >= 0.9) return { label: 'On Track', className: 'bg-blue-500/15 text-blue-400' }
  if (gmvPct >= 0.5) return { label: 'In Progress', className: 'bg-amber-500/15 text-amber-400' }
  return { label: 'Missed', className: 'bg-red-500/15 text-red-400' }
}

export function OgsmView({ periods }: OgsmViewProps) {
  return (
    <div className="space-y-6">
      {periods.map((period) => {
        const status = getQuarterStatus(period)
        return (
          <div key={period.id} className="rounded-lg border border-border bg-card">
            {/* Card Header */}
            <div className="border-b border-border px-6 py-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    Q{period.quarter}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-card-foreground">
                        Q{period.quarter} {period.year}
                      </h3>
                      <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', status.className)}>
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed max-w-2xl">
                      {period.objective}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-3 rounded-md bg-accent/40 px-4 py-2.5">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Goal — </span>
                <span className="text-xs text-card-foreground">{period.goal}</span>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
              {metricRows.map((row) => (
                <MetricBar
                  key={row.key}
                  row={row}
                  target={period.targets[row.key]}
                  actual={period.actuals[row.key]}
                />
              ))}
            </div>
          </div>
        )
      })}

      {periods.length === 0 && (
        <div className="rounded-lg border border-border bg-card px-6 py-12 text-center text-muted-foreground">
          No planning periods found.
        </div>
      )}
    </div>
  )
}
