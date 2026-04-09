import { TrendingUp, TrendingDown } from 'lucide-react'
import { formatCurrency, formatPercent, formatNumber, cn } from '@/lib/utils'

interface KpiCardProps {
  label: string
  value: number
  previousValue?: number | null
  format: 'currency' | 'number' | 'percent'
}

export function KpiCard({ label, value, previousValue = null, format }: KpiCardProps) {
  const formattedValue =
    format === 'currency'
      ? formatCurrency(value)
      : format === 'percent'
        ? formatPercent(value)
        : formatNumber(value)

  const change =
    previousValue != null && previousValue !== 0
      ? ((value - previousValue) / previousValue)
      : null

  const isPositive = change !== null && change >= 0

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="text-[11px] uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-2xl font-bold text-card-foreground">{formattedValue}</div>
      {change !== null && (
        <div className={cn('mt-1 flex items-center gap-1 text-xs', isPositive ? 'text-success' : 'text-danger')}>
          {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          <span>
            {isPositive ? '↑' : '↓'} {formatPercent(Math.abs(change))}
          </span>
        </div>
      )}
    </div>
  )
}
