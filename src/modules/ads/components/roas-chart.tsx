import { TimeSeriesChart } from '@/modules/shared/components/time-series-chart'
import type { AdsDailyMetric } from '@/modules/ads/types'

interface RoasChartProps {
  data: AdsDailyMetric[]
}

export function RoasChart({ data }: RoasChartProps) {
  return (
    <TimeSeriesChart
      title="ROAS Trend"
      data={data as unknown as Record<string, unknown>[]}
      dataKey="roas"
      xAxisKey="date"
      color="#34d399"
      valueFormatter={(v) => `${v.toFixed(1)}x`}
    />
  )
}
