import { DataTable } from '@/modules/shared/components/data-table'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils'
import type { Column } from '@/modules/shared/components/data-table'
import type { VideoDailyMetric } from '@/modules/videos/types'

interface VideoTableProps {
  data: VideoDailyMetric[]
}

type VideoRow = Record<string, unknown>

const columns: Column<VideoRow>[] = [
  { key: 'date', header: 'Date', sortable: true },
  { key: 'videoGmv', header: 'Video GMV', sortable: true, format: (v) => formatCurrency(v as number) },
  { key: 'videoViews', header: 'Views', sortable: true, format: (v) => formatNumber(v as number) },
  { key: 'gpm', header: 'GPM', sortable: true, format: (v) => formatCurrency(v as number) },
  { key: 'ctr', header: 'CTR', sortable: true, format: (v) => formatPercent(v as number) },
  { key: 'clickToOrderRate', header: 'CTOR', sortable: true, format: (v) => formatPercent(v as number) },
  { key: 'videosPosted', header: 'Posted', sortable: true, format: (v) => formatNumber(v as number) },
]

export function VideoTable({ data }: VideoTableProps) {
  return <DataTable columns={columns} data={data as unknown as VideoRow[]} />
}
