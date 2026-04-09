import { useState, useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { KpiCard } from '@/modules/shared/components/kpi-card'
import { OgsmView } from '@/modules/planning/components/ogsm-view'
import { StrategyLevers } from '@/modules/planning/components/strategy-levers'
import { usePlanningPeriods, useStrategyLevers } from '@/modules/planning/hooks'
import { cn } from '@/lib/utils'

type Tab = 'ogsm' | 'levers'

function PlanningPage() {
  const [activeTab, setActiveTab] = useState<Tab>('ogsm')

  const { data: periods, isLoading: loadingPeriods } = usePlanningPeriods('client-1')
  const { data: levers, isLoading: loadingLevers } = useStrategyLevers('client-1')

  const isLoading = loadingPeriods || loadingLevers

  const summaryKpis = useMemo(() => {
    if (!periods || !levers) return null

    // Current quarter: find the period with the highest quarter number
    const currentPeriod = periods.reduce((latest, p) =>
      p.year > latest.year || (p.year === latest.year && p.quarter > latest.quarter) ? p : latest,
      periods[0],
    )

    const ytdGmv = periods.reduce((sum, p) => sum + p.actuals.gmv, 0)

    const avgRoas =
      periods.length > 0
        ? periods.reduce((sum, p) => sum + p.actuals.roas, 0) / periods.length
        : 0

    const totalTasks = levers.reduce((sum, l) => sum + l.tasks.length, 0)
    const completedTasks = levers.reduce(
      (sum, l) => sum + l.tasks.filter((t) => t.status === 'completed').length,
      0,
    )

    return { currentPeriod, ytdGmv, avgRoas, completedTasks, totalTasks }
  }, [periods, levers])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted">
        Loading...
      </div>
    )
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'ogsm', label: 'OGSM' },
    { key: 'levers', label: 'Strategy Levers' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Planning &amp; OGSM</h2>
        <p className="text-sm text-muted">
          Track quarterly objectives, goals, strategies, and measures of success.
        </p>
      </div>

      {/* Summary KPIs */}
      {summaryKpis && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KpiCard
            label="Current Quarter"
            value={summaryKpis.currentPeriod.actuals.gmv}
            format="currency"
          />
          <KpiCard
            label="YTD GMV"
            value={summaryKpis.ytdGmv}
            format="currency"
          />
          <KpiCard
            label="Avg ROAS"
            value={summaryKpis.avgRoas}
            format="number"
          />
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="text-[11px] uppercase tracking-wide text-muted">Tasks Completed</div>
            <div className="mt-1 text-2xl font-bold text-card-foreground">
              {summaryKpis.completedTasks}
              <span className="text-base font-normal text-muted-foreground">
                {' '}/ {summaryKpis.totalTasks}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'rounded-t-md px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:text-card-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'ogsm' && (
        <OgsmView periods={periods ?? []} />
      )}

      {activeTab === 'levers' && (
        <StrategyLevers levers={levers ?? []} />
      )}
    </div>
  )
}

export const Route = createFileRoute('/$orgSlug/$clientSlug/planning')({
  component: PlanningPage,
})
