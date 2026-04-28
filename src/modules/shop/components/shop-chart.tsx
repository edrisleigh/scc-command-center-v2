import { useEffect, useState } from 'react'
import { TimeSeriesChart } from '@/modules/shared/components/time-series-chart'
import { formatCurrency, formatNumber, formatCompactNumber } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { ShopDailyMetric } from '@/modules/shop/types'
import { CHART_TAB_CATALOG, type ChartTabDefinition } from '@/modules/shop/metric-catalog'
import { useAppStore } from '@/stores/app.store'

type Tab = ChartTabDefinition['key']

interface ShopChartProps {
  data: ShopDailyMetric[]
}

export function ShopChart({ data }: ShopChartProps) {
  const visibleTabKeys = useAppStore((s) => s.shopMetricPrefs.chart)
  const visibleTabs = CHART_TAB_CATALOG.filter((t) => visibleTabKeys.includes(t.key))
  const [tab, setTab] = useState<Tab>(visibleTabs[0]?.key ?? 'revenue')

  useEffect(() => {
    if (!visibleTabs.find((t) => t.key === tab) && visibleTabs[0]) {
      setTab(visibleTabs[0].key)
    }
  }, [visibleTabKeys, tab, visibleTabs])

  const chartData = data as unknown as Record<string, unknown>[]

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-border bg-card p-6">
        <p className="text-sm text-muted">No data for the selected date range.</p>
      </div>
    )
  }

  if (visibleTabs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted">
        No chart tabs selected. Click the gear icon to customize.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center gap-0.5 border-b border-border px-5 py-3">
        {visibleTabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              tab === t.key
                ? 'bg-amber-500/10 text-amber-500'
                : 'text-muted hover:text-card-foreground',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-1">
        {tab === 'revenue' && (
          <TimeSeriesChart
            title="GMV & Gross Revenue"
            data={chartData}
            dataKey="gmv"
            secondaryDataKey="grossRevenue"
            xAxisKey="date"
            color="#f59e0b"
            secondaryColor="#14b8a6"
            valueFormatter={formatCurrency}
          />
        )}
        {tab === 'orders' && (
          <TimeSeriesChart
            title="Orders & Customers"
            data={chartData}
            dataKey="orders"
            secondaryDataKey="customers"
            xAxisKey="date"
            color="#f59e0b"
            secondaryColor="#a78bfa"
            valueFormatter={formatNumber}
          />
        )}
        {tab === 'traffic' && (
          <TimeSeriesChart
            title="Visitors & Page Views"
            data={chartData}
            dataKey="visitors"
            secondaryDataKey="pageViews"
            xAxisKey="date"
            color="#60a5fa"
            secondaryColor="#34d399"
            valueFormatter={formatCompactNumber}
          />
        )}
        {tab === 'channels' && (
          <TimeSeriesChart
            title="Video GMV & LIVE GMV"
            data={chartData}
            dataKey="videoGmv"
            secondaryDataKey="liveGmv"
            xAxisKey="date"
            color="#a78bfa"
            secondaryColor="#34d399"
            valueFormatter={formatCurrency}
          />
        )}
      </div>
    </div>
  )
}
