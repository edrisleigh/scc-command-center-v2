import { useState, useMemo } from 'react'
import { KpiCard } from '@/modules/shared/components/kpi-card'
import { CreatorList } from '@/modules/creators/components/creator-list'
import { CreatorDetail } from '@/modules/creators/components/creator-detail'
import { LiveCreatorsTab } from '@/modules/creators/components/live-creators-tab'
import { TargetCollabsTab } from '@/modules/creators/components/target-collabs-tab'
import {
  useCreators,
  useLiveCreators,
  useTargetCollabs,
  useCollaborationData,
  useCreatorIncentives,
} from '@/modules/creators/hooks'
import type { Creator } from '@/modules/creators/types'
import { cn } from '@/lib/utils'

type Tab = 'all' | 'live' | 'collabs'

export function CreatorsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('all')
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null)

  const { data: creators, isLoading: loadingCreators } = useCreators('client-1')
  const { data: liveCreators, isLoading: loadingLive } = useLiveCreators('client-1')
  const { data: targetCollabs, isLoading: loadingCollabs } = useTargetCollabs('client-1')
  const { data: collaborations } = useCollaborationData('client-1')
  const { data: incentives } = useCreatorIncentives('client-1')

  const isLoading = loadingCreators || loadingLive || loadingCollabs

  const summaryKpis = useMemo(() => {
    if (!creators) return null
    const totalCreators = creators.length
    const vipCreators = creators.filter(c => c.isVip).length
    const totalGmv = creators.reduce((sum, c) => sum + c.p28dAffiliateGmv, 0)
    const avgCommission = creators.length > 0
      ? creators.reduce((sum, c) => sum + c.blendedCommissionRate, 0) / creators.length
      : 0
    return { totalCreators, vipCreators, totalGmv, avgCommission }
  }, [creators])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted">
        Loading...
      </div>
    )
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: 'All Creators' },
    { key: 'live', label: 'LIVE Creators' },
    { key: 'collabs', label: 'Target Collabs' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Creator Management</h2>
        <p className="text-sm text-muted">Manage creators, track performance, and monitor collaborations.</p>
      </div>

      {/* Summary KPIs */}
      {summaryKpis && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KpiCard label="Total Creators" value={summaryKpis.totalCreators} format="number" />
          <KpiCard label="VIP Creators" value={summaryKpis.vipCreators} format="number" />
          <KpiCard label="Total P28D GMV" value={summaryKpis.totalGmv} format="currency" />
          <KpiCard label="Avg Commission Rate" value={summaryKpis.avgCommission} format="percent" />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setSelectedCreator(null) }}
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
      {activeTab === 'all' && (
        <div className="space-y-6">
          <CreatorList
            creators={creators ?? []}
            onSelect={setSelectedCreator}
            selectedId={selectedCreator?.id}
          />
          {selectedCreator && (
            <CreatorDetail
              creator={selectedCreator}
              collaborations={collaborations}
              incentives={incentives}
              onClose={() => setSelectedCreator(null)}
            />
          )}
        </div>
      )}

      {activeTab === 'live' && (
        <LiveCreatorsTab liveCreators={liveCreators ?? []} />
      )}

      {activeTab === 'collabs' && (
        <TargetCollabsTab collabs={targetCollabs ?? []} />
      )}
    </div>
  )
}
