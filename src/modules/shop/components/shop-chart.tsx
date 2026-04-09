import { TimeSeriesChart } from '@/modules/shared/components/time-series-chart'
import { formatCurrency } from '@/lib/utils'
import type { ShopDailyMetric } from '@/modules/shop/types'

interface ShopChartProps {
  data: ShopDailyMetric[]
}

export function ShopChart({ data }: ShopChartProps) {
  return (
    <TimeSeriesChart
      title="GMV Over Time"
      data={data as unknown as Record<string, unknown>[]}
      dataKey="gmv"
      xAxisKey="date"
      color="#a78bfa"
      valueFormatter={formatCurrency}
    />
  )
}
