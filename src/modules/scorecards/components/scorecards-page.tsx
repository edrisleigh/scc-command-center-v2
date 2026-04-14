import { useState, useMemo } from 'react'
import { KpiCard } from '@/modules/shared/components/kpi-card'
import { WeeklyScorecardTable } from '@/modules/scorecards/components/weekly-scorecard'
import { MonthlyScorecardTable } from '@/modules/scorecards/components/monthly-scorecard'
import { useWeeklyScorecard, useMonthlyScorecard } from '@/modules/scorecards/hooks'
import { cn } from '@/lib/utils'

type Tab = 'weekly' | 'monthly'

export function ScorecardsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('weekly')

  const { data: weeklyData, isLoading: loadingWeekly } = useWeeklyScorecard('client-1')
  const { data: monthlyData, isLoading: loadingMonthly } = useMonthlyScorecard('client-1')

  const isLoading = loadingWeekly || loadingMonthly

  const summaryKpis = useMemo(() => {
    const weekly = weeklyData ?? []
    const monthly = monthlyData ?? []

    const sorted = [...weekly].sort((a, b) => b.weekStarting.localeCompare(a.weekStarting))
    const latestWeekGmv = sorted[0]?.gmv ?? 0

    const now = new Date()
    const currentMonth = now.getMonth() + 1
    const currentYear = now.getFullYear()
    const mtdEntry = monthly.find((m) => m.month === currentMonth && m.year === currentYear)
    const mtdGmv = mtdEntry?.gmv ?? 0

    const avgWeeklyRoas =
      weekly.length > 0
        ? weekly.reduce((sum, w) => sum + w.roas, 0) / weekly.length
        : 0

    const totalVideosPosted = weekly.reduce((sum, w) => sum + w.videosPosted, 0)

    return { latestWeekGmv, mtdGmv, avgWeeklyRoas, totalVideosPosted }
  }, [weeklyData, monthlyData])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted">
        Loading...
      </div>
    )
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Scorecards</h2>
        <p className="text-sm text-muted">Weekly and monthly performance summaries across all key KPIs.</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="Latest Week GMV" value={summaryKpis.latestWeekGmv} format="currency" />
        <KpiCard label="MTD GMV" value={summaryKpis.mtdGmv} format="currency" />
        <KpiCard label="Avg Weekly ROAS" value={summaryKpis.avgWeeklyRoas} format="number" />
        <KpiCard label="Total Videos Posted" value={summaryKpis.totalVideosPosted} format="number" />
      </div>

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
      {activeTab === 'weekly' && (
        <div className="space-y-4">
          <p className="text-xs text-muted">
            {weeklyData?.length ?? 0} weeks shown — Jul 2025 to Nov 2025. GMV delta shown vs prior week.
          </p>
          <WeeklyScorecardTable data={weeklyData ?? []} />
        </div>
      )}

      {activeTab === 'monthly' && (
        <div className="space-y-4">
          <p className="text-xs text-muted">
            {monthlyData?.length ?? 0} months shown — Jul 2024 to Jun 2025. Growth % vs prior month.
          </p>
          <MonthlyScorecardTable data={monthlyData ?? []} />
        </div>
      )}
    </div>
  )
}
