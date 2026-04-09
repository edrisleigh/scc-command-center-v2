import { createFileRoute } from '@tanstack/react-router'
import { useVideoMetrics } from '@/modules/videos/hooks'
import { VideoKpis } from '@/modules/videos/components/video-kpis'
import { VideoChart } from '@/modules/videos/components/video-chart'
import { VideoFunnel } from '@/modules/videos/components/video-funnel'
import { VideoTable } from '@/modules/videos/components/video-table'
import { exportToCsv } from '@/lib/export'
import { ExportButton } from '@/modules/shared/components/export-button'

function VideosPage() {
  const { data, isLoading } = useVideoMetrics('client-1')

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
          <h2 className="text-xl font-bold text-foreground">Video Performance</h2>
          <p className="text-sm text-muted">Track video GMV, views, and conversion funnel metrics.</p>
        </div>
        <ExportButton onClick={() => exportToCsv(metrics, 'video-analytics')} />
      </div>
      <VideoKpis data={metrics} previousData={[]} />
      <VideoChart data={metrics} />
      <VideoFunnel data={metrics} />
      <VideoTable data={metrics} />
    </div>
  )
}

export const Route = createFileRoute('/$orgSlug/$clientSlug/videos')({
  component: VideosPage,
})
