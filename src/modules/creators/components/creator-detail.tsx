import { X } from 'lucide-react'
import { KpiCard } from '@/modules/shared/components/kpi-card'
import { formatCurrency, formatPercent, cn } from '@/lib/utils'
import type { Creator } from '@/modules/creators/types'
import type { CollaborationData, CreatorIncentive } from '@/modules/creators/types'

interface CreatorDetailProps {
  creator: Creator
  collaborations?: CollaborationData[]
  incentives?: CreatorIncentive[]
  onClose: () => void
}

export function CreatorDetail({ creator, collaborations, incentives, onClose }: CreatorDetailProps) {
  const creatorCollabs = collaborations?.filter(c => c.creatorId === creator.id) ?? []
  const creatorIncentives = incentives?.filter(i => i.creatorId === creator.id) ?? []

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-3">
          <h3 className="text-lg font-bold text-card-foreground">{creator.username}</h3>
          {creator.isVip && (
            <span className="inline-block rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-400">VIP</span>
          )}
          {creator.isBrandPod && (
            <span className="inline-block rounded-full bg-violet-500/15 px-2.5 py-0.5 text-xs font-medium text-violet-400">Brand POD</span>
          )}
        </div>
        <button onClick={onClose} className="rounded p-1 text-muted-foreground hover:text-card-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
        <KpiCard label="P28D GMV" value={creator.p28dAffiliateGmv} format="currency" />
        <KpiCard label="Products Sold" value={creator.affiliateProductsSold} format="number" />
        <KpiCard label="Commission Rate" value={creator.blendedCommissionRate} format="percent" />
        <KpiCard label="Followers" value={creator.affiliateFollowers} format="number" />
        <KpiCard label="GPM" value={creator.gpm} format="currency" />
        <KpiCard label="CTR" value={creator.ctr} format="percent" />
        <KpiCard label="GMV/Sample" value={creator.gmvPerSample} format="currency" />
        <KpiCard label="Avg Order Value" value={creator.avgOrderValue} format="currency" />
      </div>

      {/* Additional Stats */}
      <div className="border-t border-border px-5 py-4">
        <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-3">
          <div>
            <span className="text-muted-foreground">Vs Prior Period: </span>
            <span className={cn(creator.deltaVsPriorPeriod >= 0 ? 'text-success' : 'text-danger')}>
              {creator.deltaVsPriorPeriod >= 0 ? '+' : ''}{formatCurrency(creator.deltaVsPriorPeriod)}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Affiliate LIVE: </span>
            <span className="text-card-foreground">{formatPercent(creator.affiliateLivePct)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Samples This Year: </span>
            <span className="text-card-foreground">{creator.samplesThisYear}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Product Impressions: </span>
            <span className="text-card-foreground">{creator.productImpressions.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Collaborations */}
      {creatorCollabs.length > 0 && (
        <div className="border-t border-border px-5 py-4">
          <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">Recent Collaborations</h4>
          <div className="space-y-2">
            {creatorCollabs.map((collab) => (
              <div key={collab.id} className="flex items-center justify-between rounded-md bg-accent/30 px-3 py-2 text-sm">
                <div>
                  <span className={cn(
                    'mr-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium',
                    collab.type === 'target' ? 'bg-blue-500/15 text-blue-400' : 'bg-emerald-500/15 text-emerald-400',
                  )}>
                    {collab.type}
                  </span>
                  <span className="text-muted-foreground">{collab.period}</span>
                </div>
                <span className="font-medium text-card-foreground">{formatCurrency(collab.gmv)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Incentives */}
      {creatorIncentives.length > 0 && (
        <div className="border-t border-border px-5 py-4">
          <h4 className="mb-3 text-xs font-medium uppercase tracking-wider text-muted">Incentives</h4>
          <div className="space-y-2">
            {creatorIncentives.map((incentive) => (
              <div key={incentive.id} className="flex items-center justify-between rounded-md bg-accent/30 px-3 py-2 text-sm">
                <div>
                  <span className="font-medium text-card-foreground">{incentive.type}</span>
                  <span className="ml-2 text-muted-foreground">{incentive.period}</span>
                </div>
                <span className="font-medium text-success">{formatCurrency(incentive.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
