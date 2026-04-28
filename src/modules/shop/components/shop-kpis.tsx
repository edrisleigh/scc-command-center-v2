import { KpiCard } from '@/modules/shared/components/kpi-card'
import type { ShopDailyMetric } from '@/modules/shop/types'
import { useAppStore } from '@/stores/app.store'
import {
  SHOP_METRIC_CATALOG,
  aggregate,
  getMetricDefinition,
} from '@/modules/shop/metric-catalog'

interface ShopKpisProps {
  data: ShopDailyMetric[]
  previousData: ShopDailyMetric[]
}

export function ShopKpis({ data, previousData }: ShopKpisProps) {
  const selected = useAppStore((s) => s.shopMetricPrefs.kpi)

  const visible = selected
    .map((key) => getMetricDefinition(key))
    .filter((def): def is (typeof SHOP_METRIC_CATALOG)[number] => Boolean(def))

  if (visible.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border bg-card/50 p-6 text-center text-sm text-muted">
        No KPIs selected. Click the gear icon to customize.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {visible.map((def) => {
        const value = aggregate(data, def)
        const prev = aggregate(previousData, def)
        return (
          <KpiCard
            key={def.key}
            label={def.label}
            value={value}
            previousValue={prev || null}
            format={def.format}
          />
        )
      })}
    </div>
  )
}
