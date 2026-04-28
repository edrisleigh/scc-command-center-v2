import { useAdsMetrics } from '@/modules/ads/hooks'
import { AdsKpis } from '@/modules/ads/components/ads-kpis'
import { RoasChart } from '@/modules/ads/components/roas-chart'
import { CollabsComparison } from '@/modules/ads/components/collabs-comparison'
import { AdsTable } from '@/modules/ads/components/ads-table'
import { exportToCsv } from '@/lib/export'
import { ExportButton } from '@/modules/shared/components/export-button'
import { FreshnessBadge } from '@/modules/freshness/components/freshness-badge'
import { FlagButton } from '@/modules/flags/components/flag-button'

export function AdsPage() {
  const { data, isLoading } = useAdsMetrics('client-1')

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted">
        Loading...
      </div>
    )
  }

  const metrics = data ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-foreground">Ads Management</h2>
            <FreshnessBadge source="ads-daily" size="sm" />
          </div>
          <p className="text-sm text-muted">Monitor ad spend, ROAS, and collaboration performance.</p>
        </div>
        <div className="flex items-center gap-2">
          <FlagButton section="ads" />
          <ExportButton onClick={() => exportToCsv(metrics, 'ads-analytics')} />
        </div>
      </div>
      <AdsKpis data={metrics} previousData={[]} />
      <RoasChart data={metrics} />
      <CollabsComparison data={metrics} />
      <AdsTable data={metrics} />
    </div>
  )
}
