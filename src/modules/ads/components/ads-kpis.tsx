import { KpiCard } from '@/modules/shared/components/kpi-card'
import type { AdsDailyMetric } from '@/modules/ads/types'

interface AdsKpisProps {
  data: AdsDailyMetric[]
  previousData: AdsDailyMetric[]
}

function sumKey(data: AdsDailyMetric[], key: keyof AdsDailyMetric): number {
  return data.reduce((acc, d) => acc + (d[key] as number), 0)
}

export function AdsKpis({ data, previousData }: AdsKpisProps) {
  const adSpend = sumKey(data, 'adSpend')
  const prevAdSpend = sumKey(previousData, 'adSpend')

  const adGmv = sumKey(data, 'adDrivenGmv')
  const prevAdGmv = sumKey(previousData, 'adDrivenGmv')

  const roas = adSpend > 0 ? adGmv / adSpend : 0
  const prevRoas = prevAdSpend > 0 ? prevAdGmv / prevAdSpend : 0

  const commission = sumKey(data, 'commission')
  const prevCommission = sumKey(previousData, 'commission')

  const totalGmvForAds = sumKey(data, 'adDrivenGmv')
  const adsPctGmv = data.length > 0
    ? data.reduce((acc, d) => acc + d.adsPctGmv, 0) / data.length
    : 0
  const prevAdsPctGmv = previousData.length > 0
    ? previousData.reduce((acc, d) => acc + d.adsPctGmv, 0) / previousData.length
    : 0

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      <KpiCard label="Ad Spend" value={adSpend} previousValue={prevAdSpend || null} format="currency" />
      <KpiCard label="Ad-Driven GMV" value={adGmv} previousValue={prevAdGmv || null} format="currency" />
      <KpiCard label="ROAS" value={roas} previousValue={prevRoas || null} format="number" />
      <KpiCard label="Commission" value={commission} previousValue={prevCommission || null} format="currency" />
      <KpiCard label="Ads % of GMV" value={adsPctGmv} previousValue={prevAdsPctGmv || null} format="percent" />
    </div>
  )
}
