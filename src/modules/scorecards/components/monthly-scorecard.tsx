import { useMemo } from 'react'
import { formatCurrency, formatPercent, formatNumber, formatCompactNumber, cn } from '@/lib/utils'
import type { MonthlyScorecard } from '@/modules/scorecards/types'

const MONTH_NAMES = [
  '', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

interface MonthlyScorecardTableProps {
  data: MonthlyScorecard[]
}

export function MonthlyScorecardTable({ data }: MonthlyScorecardTableProps) {
  const rows = useMemo(
    () =>
      [...data].sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year
        return a.month - b.month
      }),
    [data],
  )

  const headers = [
    'Month', 'GMV', 'MoM Growth', 'Revenue', 'AOV', 'ASP',
    'Visitors', 'CVR', 'Customers', 'Videos', 'Views', 'GPM',
    'Live%', 'Video%', 'Card%', 'Affiliate%',
  ]

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {headers.map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const growth = row.growthVsPrevMonth
              const growthFormatted =
                growth === 0
                  ? '—'
                  : `${growth >= 0 ? '▲' : '▼'} ${formatPercent(Math.abs(growth))}`
              const growthClass = growth > 0 ? 'text-success' : growth < 0 ? 'text-danger' : 'text-muted'

              return (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-accent/50">
                  <td className="px-4 py-3 text-card-foreground font-medium whitespace-nowrap">
                    {MONTH_NAMES[row.month]} {row.year}
                  </td>
                  <td className="px-4 py-3 text-card-foreground">{formatCurrency(row.gmv)}</td>
                  <td className={cn('px-4 py-3 font-medium', growthClass)}>{growthFormatted}</td>
                  <td className="px-4 py-3 text-card-foreground">{formatCurrency(row.grossRevenue)}</td>
                  <td className="px-4 py-3 text-card-foreground">${row.aov.toFixed(2)}</td>
                  <td className="px-4 py-3 text-card-foreground">${row.asp.toFixed(2)}</td>
                  <td className="px-4 py-3 text-card-foreground">{formatCompactNumber(row.visitors)}</td>
                  <td className="px-4 py-3 text-card-foreground">{formatPercent(row.cvr)}</td>
                  <td className="px-4 py-3 text-card-foreground">{formatNumber(row.customers)}</td>
                  <td className="px-4 py-3 text-card-foreground">{formatNumber(row.videosPosted)}</td>
                  <td className="px-4 py-3 text-card-foreground">{formatCompactNumber(row.videoViews)}</td>
                  <td className="px-4 py-3 text-card-foreground">${row.videoGpm.toFixed(2)}</td>
                  <td className="px-4 py-3 text-card-foreground">{formatPercent(row.liveGmvPct)}</td>
                  <td className="px-4 py-3 text-card-foreground">{formatPercent(row.videoGmvPct)}</td>
                  <td className="px-4 py-3 text-card-foreground">{formatPercent(row.productCardGmvPct)}</td>
                  <td className="px-4 py-3 text-card-foreground">{formatPercent(row.affiliateGmvPct)}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
