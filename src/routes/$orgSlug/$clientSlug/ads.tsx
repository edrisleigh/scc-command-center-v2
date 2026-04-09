import { createFileRoute } from '@tanstack/react-router'
import { useAdsMetrics } from '@/modules/ads/hooks'
import { AdsKpis } from '@/modules/ads/components/ads-kpis'
import { RoasChart } from '@/modules/ads/components/roas-chart'
import { CollabsComparison } from '@/modules/ads/components/collabs-comparison'
import { AdsTable } from '@/modules/ads/components/ads-table'

function AdsPage() {
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
      <div>
        <h2 className="text-xl font-bold text-foreground">Ads Management</h2>
        <p className="text-sm text-muted">Monitor ad spend, ROAS, and collaboration performance.</p>
      </div>
      <AdsKpis data={metrics} previousData={[]} />
      <RoasChart data={metrics} />
      <CollabsComparison data={metrics} />
      <AdsTable data={metrics} />
    </div>
  )
}

export const Route = createFileRoute('/$orgSlug/$clientSlug/ads')({
  component: AdsPage,
})
