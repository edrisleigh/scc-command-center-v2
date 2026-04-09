import { DataTable } from '@/modules/shared/components/data-table'
import { formatCurrency, formatPercent } from '@/lib/utils'
import type { Column } from '@/modules/shared/components/data-table'
import type { AdsDailyMetric } from '@/modules/ads/types'

interface AdsTableProps {
  data: AdsDailyMetric[]
}

type AdsRow = Record<string, unknown>

const columns: Column<AdsRow>[] = [
  { key: 'date', header: 'Date', sortable: true },
  { key: 'adSpend', header: 'Ad Spend', sortable: true, format: (v) => formatCurrency(v as number) },
  { key: 'adDrivenGmv', header: 'Ad GMV', sortable: true, format: (v) => formatCurrency(v as number) },
  { key: 'roas', header: 'ROAS', sortable: true, format: (v) => `${(v as number).toFixed(1)}x` },
  { key: 'commission', header: 'Commission', sortable: true, format: (v) => formatCurrency(v as number) },
  { key: 'commissionRate', header: 'Comm. Rate', sortable: true, format: (v) => formatPercent(v as number) },
  { key: 'targetCollabsGmv', header: 'Target GMV', sortable: true, format: (v) => formatCurrency(v as number) },
  { key: 'openCollabsGmv', header: 'Open GMV', sortable: true, format: (v) => formatCurrency(v as number) },
]

export function AdsTable({ data }: AdsTableProps) {
  return <DataTable columns={columns} data={data as unknown as AdsRow[]} />
}
