import { DataTable } from '@/modules/shared/components/data-table'
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils'
import type { Column } from '@/modules/shared/components/data-table'
import type { ShopDailyMetric } from '@/modules/shop/types'

interface ShopTableProps {
  data: ShopDailyMetric[]
}

type ShopRow = Record<string, unknown>

const columns: Column<ShopRow>[] = [
  { key: 'date', header: 'Date', sortable: true },
  { key: 'gmv', header: 'GMV', sortable: true, format: (v) => formatCurrency(v as number) },
  { key: 'grossRevenue', header: 'Revenue', sortable: true, format: (v) => formatCurrency(v as number) },
  { key: 'orders', header: 'Orders', sortable: true, format: (v) => formatNumber(v as number) },
  { key: 'customers', header: 'Customers', sortable: true, format: (v) => formatNumber(v as number) },
  { key: 'visitors', header: 'Visitors', sortable: true, format: (v) => formatNumber(v as number) },
  { key: 'conversionRate', header: 'CVR', sortable: true, format: (v) => formatPercent(v as number) },
]

export function ShopTable({ data }: ShopTableProps) {
  return <DataTable columns={columns} data={data as unknown as ShopRow[]} />
}
