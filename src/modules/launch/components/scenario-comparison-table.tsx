import type { ScenarioOutputs, ScenarioKey } from '@/modules/launch/types'
import { SCENARIO_LABELS } from '@/modules/launch/constants'
import { formatCurrency, formatNumber, cn } from '@/lib/utils'

interface ScenarioComparisonTableProps {
  outputs: Record<ScenarioKey, ScenarioOutputs>
}

interface Row {
  label: string
  pick: (o: ScenarioOutputs) => number
  format: (v: number) => string
  emphasis?: boolean
}

const ROWS: Row[] = [
  { label: 'TTS GMV', pick: (o) => o.totals.ttsGmv, format: formatCurrency },
  { label: 'New customers (TTS)', pick: (o) => o.totals.ttsOrders, format: formatNumber },
  { label: 'Videos', pick: (o) => o.totals.videos, format: formatNumber },
  { label: 'Video views', pick: (o) => o.totals.videoViews, format: formatNumber },
  { label: 'DTC incremental rev.', pick: (o) => o.totals.dtcRevenue, format: formatCurrency },
  { label: 'Amazon halo rev.', pick: (o) => o.totals.amazonRevenue, format: formatCurrency },
  { label: 'Net profit', pick: (o) => o.totals.netProfit, format: formatCurrency, emphasis: true },
]

const KEYS: ScenarioKey[] = ['conservative', 'balanced', 'aggressive', 'rapid_scale']

export function ScenarioComparisonTable({ outputs }: ScenarioComparisonTableProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 overflow-x-auto">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
        Side-by-side detail · 6-month totals
      </h3>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[10px] uppercase tracking-wide text-muted">
            <th className="py-2 text-left font-medium">Metric</th>
            {KEYS.map((k) => (
              <th key={k} className="py-2 px-3 text-right font-medium">{SCENARIO_LABELS[k]}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => {
            const values = KEYS.map((k) => row.pick(outputs[k]))
            const max = Math.max(...values)
            return (
              <tr key={row.label} className="border-t border-border/50">
                <td className={cn('py-2 text-muted', row.emphasis && 'font-semibold text-card-foreground')}>
                  {row.label}
                </td>
                {KEYS.map((k, i) => {
                  const v = values[i]
                  const isBest = v === max && max > 0
                  return (
                    <td
                      key={k}
                      className={cn(
                        'py-2 px-3 text-right tabular-nums',
                        isBest ? 'text-success font-semibold' : 'text-card-foreground',
                        row.emphasis && 'font-semibold',
                      )}
                    >
                      {row.format(v)}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
