import { TimeSeriesChart } from '@/modules/shared/components/time-series-chart'
import { formatCurrency } from '@/lib/utils'
import type { VideoDailyMetric } from '@/modules/videos/types'

interface VideoChartProps {
  data: VideoDailyMetric[]
}

export function VideoChart({ data }: VideoChartProps) {
  return (
    <TimeSeriesChart
      title="Video GMV & Views Over Time"
      data={data as unknown as Record<string, unknown>[]}
      dataKey="videoGmv"
      secondaryDataKey="videoViews"
      xAxisKey="date"
      color="#a78bfa"
      secondaryColor="#60a5fa"
      valueFormatter={formatCurrency}
    />
  )
}
