import { useMemo } from 'react'
import { DataTable } from '@/modules/shared/components/data-table'
import { formatCurrency, formatPercent, formatNumber, formatCompactNumber, cn } from '@/lib/utils'
import type { WeeklyScorecard } from '@/modules/scorecards/types'
import type { Column } from '@/modules/shared/components/data-table'

interface WeeklyScorecardTableProps {
  data: WeeklyScorecard[]
}

function formatWeek(weekStarting: string, weekEnding: string): string {
  const start = new Date(weekStarting + 'T00:00:00')
  const end = new Date(weekEnding + 'T00:00:00')
  const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${startStr} – ${endStr}`
}

type WeeklyScorecardRow = WeeklyScorecard & {
  weekLabel: string
  gmvDelta: number | null
}

export function WeeklyScorecardTable({ data }: WeeklyScorecardTableProps) {
  const rows = useMemo<WeeklyScorecardRow[]>(() => {
    const sorted = [...data].sort((a, b) => a.weekStarting.localeCompare(b.weekStarting))
    return sorted.map((row, i) => {
      const prev = sorted[i - 1]
      const gmvDelta = prev ? (row.gmv - prev.gmv) / prev.gmv : null
      return {
        ...row,
        weekLabel: formatWeek(row.weekStarting, row.weekEnding),
        gmvDelta,
      }
    })
  }, [data])

  const columns: Column<WeeklyScorecardRow>[] = [
    {
      key: 'weekLabel',
      header: 'Week',
      sortable: true,
      format: (v) => String(v),
    },
    {
      key: 'gmv',
      header: 'GMV',
      sortable: true,
      format: (v) => formatCurrency(v as number),
    },
    {
      key: 'grossRevenue',
      header: 'Revenue',
      sortable: true,
      format: (v) => formatCurrency(v as number),
    },
    {
      key: 'orders',
      header: 'Orders',
      sortable: true,
      format: (v) => formatNumber(v as number),
    },
    {
      key: 'customers',
      header: 'Customers',
      sortable: true,
      format: (v) => formatNumber(v as number),
    },
    {
      key: 'cvr',
      header: 'CVR',
      sortable: true,
      format: (v) => formatPercent(v as number),
    },
    {
      key: 'adSpend',
      header: 'Ad Spend',
      sortable: true,
      format: (v) => formatCurrency(v as number),
    },
    {
      key: 'roas',
      header: 'ROAS',
      sortable: true,
      format: (v) => `${(v as number).toFixed(1)}x`,
    },
    {
      key: 'videosPosted',
      header: 'Videos',
      sortable: true,
      format: (v) => formatNumber(v as number),
    },
    {
      key: 'videoViews',
      header: 'Views',
      sortable: true,
      format: (v) => formatCompactNumber(v as number),
    },
    {
      key: 'videoGpm',
      header: 'GPM',
      sortable: true,
      format: (v) => `$${(v as number).toFixed(2)}`,
    },
    {
      key: 'liveGmvPct',
      header: 'Live%',
      sortable: true,
      format: (v) => formatPercent(v as number),
    },
    {
      key: 'videoGmvPct',
      header: 'Video%',
      sortable: true,
      format: (v) => formatPercent(v as number),
    },
    {
      key: 'affiliateGmvPct',
      header: 'Affiliate%',
      sortable: true,
      format: (v) => formatPercent(v as number),
    },
  ]

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted"
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} className="border-b border-border last:border-0 hover:bg-accent/50">
                {columns.map((col) => {
                  const value = row[col.key]
                  const formatted = col.format ? col.format(value) : String(value)

                  // Color-code GMV delta on the GMV column
                  let cellClass = 'px-4 py-3 text-card-foreground'
                  if (col.key === 'gmv' && row.gmvDelta !== null) {
                    cellClass = cn(
                      cellClass,
                      row.gmvDelta >= 0 ? 'text-success' : 'text-danger',
                    )
                  }

                  return (
                    <td key={col.key} className={cellClass}>
                      {col.key === 'gmv' && row.gmvDelta !== null ? (
                        <span className="flex flex-col">
                          <span>{formatted}</span>
                          <span className={cn('text-[10px]', row.gmvDelta >= 0 ? 'text-success' : 'text-danger')}>
                            {row.gmvDelta >= 0 ? '▲' : '▼'} {formatPercent(Math.abs(row.gmvDelta))}
                          </span>
                        </span>
                      ) : (
                        formatted
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
