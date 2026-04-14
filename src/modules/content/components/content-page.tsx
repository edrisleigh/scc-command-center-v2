import { useState, useMemo } from 'react'
import { KpiCard } from '@/modules/shared/components/kpi-card'
import { ContentList } from '@/modules/content/components/content-list'
import { SparkCodesList } from '@/modules/content/components/spark-codes-list'
import { useContentSubmissions, useSparkCodes } from '@/modules/content/hooks'
import { cn } from '@/lib/utils'

type Tab = 'submissions' | 'spark-codes'

export function ContentPage() {
  const [activeTab, setActiveTab] = useState<Tab>('submissions')

  const { data: submissions, isLoading: loadingSubmissions } = useContentSubmissions('client-1')
  const { data: sparkCodes, isLoading: loadingSparkCodes } = useSparkCodes('client-1')

  const isLoading = loadingSubmissions || loadingSparkCodes

  const kpis = useMemo(() => {
    const totalSubmissions = submissions?.length ?? 0
    const paidContent = submissions?.filter(s => s.type === 'paid').length ?? 0
    const freeContent = submissions?.filter(s => s.type === 'free').length ?? 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const activeSparkCodes = sparkCodes?.filter(sc => {
      const exp = new Date(sc.expirationDate)
      exp.setHours(0, 0, 0, 0)
      return exp >= today
    }).length ?? 0
    return { totalSubmissions, paidContent, freeContent, activeSparkCodes }
  }, [submissions, sparkCodes])

  const tabs: { key: Tab; label: string }[] = [
    { key: 'submissions', label: 'Content Submissions' },
    { key: 'spark-codes', label: 'Spark Codes' },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted">
        Loading...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Content &amp; Spark Codes</h2>
        <p className="text-sm text-muted">Track content submissions and manage spark code permissions.</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="Total Submissions" value={kpis.totalSubmissions} format="number" />
        <KpiCard label="Paid Content" value={kpis.paidContent} format="number" />
        <KpiCard label="Free Content" value={kpis.freeContent} format="number" />
        <KpiCard label="Active Spark Codes" value={kpis.activeSparkCodes} format="number" />
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
      {activeTab === 'submissions' && (
        <ContentList submissions={submissions ?? []} />
      )}

      {activeTab === 'spark-codes' && (
        <SparkCodesList sparkCodes={sparkCodes ?? []} />
      )}
    </div>
  )
}
