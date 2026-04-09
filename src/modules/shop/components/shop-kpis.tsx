import { KpiCard } from '@/modules/shared/components/kpi-card'
import type { ShopDailyMetric } from '@/modules/shop/types'

interface ShopKpisProps {
  data: ShopDailyMetric[]
  previousData: ShopDailyMetric[]
}

function sumKey(data: ShopDailyMetric[], key: keyof ShopDailyMetric): number {
  return data.reduce((acc, d) => acc + (d[key] as number), 0)
}

function avgKey(data: ShopDailyMetric[], key: keyof ShopDailyMetric): number {
  if (data.length === 0) return 0
  return sumKey(data, key) / data.length
}

export function ShopKpis({ data, previousData }: ShopKpisProps) {
  const gmv = sumKey(data, 'gmv')
  const prevGmv = sumKey(previousData, 'gmv')

  const revenue = sumKey(data, 'grossRevenue')
  const prevRevenue = sumKey(previousData, 'grossRevenue')

  const orders = sumKey(data, 'orders')
  const prevOrders = sumKey(previousData, 'orders')

  const customers = sumKey(data, 'customers')
  const prevCustomers = sumKey(previousData, 'customers')

  const visitors = sumKey(data, 'visitors')
  const prevVisitors = sumKey(previousData, 'visitors')

  const cvr = avgKey(data, 'conversionRate')
  const prevCvr = avgKey(previousData, 'conversionRate')

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      <KpiCard label="GMV" value={gmv} previousValue={prevGmv || null} format="currency" />
      <KpiCard label="Gross Revenue" value={revenue} previousValue={prevRevenue || null} format="currency" />
      <KpiCard label="Orders" value={orders} previousValue={prevOrders || null} format="number" />
      <KpiCard label="Customers" value={customers} previousValue={prevCustomers || null} format="number" />
      <KpiCard label="Visitors" value={visitors} previousValue={prevVisitors || null} format="number" />
      <KpiCard label="CVR" value={cvr} previousValue={prevCvr || null} format="percent" />
    </div>
  )
}
