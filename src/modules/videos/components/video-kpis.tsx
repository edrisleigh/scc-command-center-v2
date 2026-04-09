import { KpiCard } from '@/modules/shared/components/kpi-card'
import type { VideoDailyMetric } from '@/modules/videos/types'

interface VideoKpisProps {
  data: VideoDailyMetric[]
  previousData: VideoDailyMetric[]
}

function sumKey(data: VideoDailyMetric[], key: keyof VideoDailyMetric): number {
  return data.reduce((acc, d) => acc + (d[key] as number), 0)
}

function avgKey(data: VideoDailyMetric[], key: keyof VideoDailyMetric): number {
  if (data.length === 0) return 0
  return sumKey(data, key) / data.length
}

export function VideoKpis({ data, previousData }: VideoKpisProps) {
  const videoGmv = sumKey(data, 'videoGmv')
  const prevVideoGmv = sumKey(previousData, 'videoGmv')

  const videoViews = sumKey(data, 'videoViews')
  const prevVideoViews = sumKey(previousData, 'videoViews')

  const gpm = avgKey(data, 'gpm')
  const prevGpm = avgKey(previousData, 'gpm')

  const ctr = avgKey(data, 'ctr')
  const prevCtr = avgKey(previousData, 'ctr')

  const videosPosted = sumKey(data, 'videosPosted')
  const prevVideosPosted = sumKey(previousData, 'videosPosted')

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      <KpiCard label="Video GMV" value={videoGmv} previousValue={prevVideoGmv || null} format="currency" />
      <KpiCard label="Video Views" value={videoViews} previousValue={prevVideoViews || null} format="number" />
      <KpiCard label="GPM" value={gpm} previousValue={prevGpm || null} format="currency" />
      <KpiCard label="CTR" value={ctr} previousValue={prevCtr || null} format="percent" />
      <KpiCard label="Videos Posted" value={videosPosted} previousValue={prevVideosPosted || null} format="number" />
    </div>
  )
}
