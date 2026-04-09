import { createFileRoute } from '@tanstack/react-router'
import { useShopMetrics } from '@/modules/shop/hooks'
import { ShopKpis } from '@/modules/shop/components/shop-kpis'
import { ShopChart } from '@/modules/shop/components/shop-chart'
import { ChannelBreakdown } from '@/modules/shop/components/channel-breakdown'
import { ShopTable } from '@/modules/shop/components/shop-table'
import { exportToCsv } from '@/lib/export'
import { ExportButton } from '@/modules/shared/components/export-button'

function ShopPage() {
  const { data, isLoading } = useShopMetrics('client-1')

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
          <h2 className="text-xl font-bold text-foreground">Shop Analytics</h2>
          <p className="text-sm text-muted">Overview of shop performance including GMV, orders, and channel breakdown.</p>
        </div>
        <ExportButton onClick={() => exportToCsv(metrics, 'shop-analytics')} />
      </div>
      <ShopKpis data={metrics} previousData={[]} />
      <ShopChart data={metrics} />
      <ChannelBreakdown data={metrics} />
      <ShopTable data={metrics} />
    </div>
  )
}

export const Route = createFileRoute('/$orgSlug/$clientSlug/shop')({
  component: ShopPage,
})
