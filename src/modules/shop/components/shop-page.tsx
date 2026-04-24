import { useState } from 'react'
import { Settings2 } from 'lucide-react'
import { useShopMetrics } from '@/modules/shop/hooks'
import { ShopKpis } from '@/modules/shop/components/shop-kpis'
import { ShopChart } from '@/modules/shop/components/shop-chart'
import { ChannelBreakdown } from '@/modules/shop/components/channel-breakdown'
import { ShopTable } from '@/modules/shop/components/shop-table'
import { CustomizeMetricsDialog } from '@/modules/shop/components/customize-metrics-dialog'
import { exportToCsv } from '@/lib/export'
import { ExportButton } from '@/modules/shared/components/export-button'
import { useAppStore } from '@/stores/app.store'
import { FreshnessBadge } from '@/modules/freshness/components/freshness-badge'
import type { DataSource } from '@/modules/freshness/types'
import { FlagButton } from '@/modules/flags/components/flag-button'
import type { FlagSection } from '@/modules/flags/types'
import {
  SHOP_METRIC_CATALOG,
  CHART_TAB_CATALOG,
  CHANNEL_SECTION_CATALOG,
  DEFAULT_KPI_METRICS,
  DEFAULT_CHART_TABS,
  DEFAULT_CHANNEL_SECTIONS,
} from '@/modules/shop/metric-catalog'

type SectionKey = 'kpi' | 'chart' | 'channel' | null

function SectionHeader({
  title,
  onCustomize,
  source,
  flagSection,
}: {
  title: string
  onCustomize?: () => void
  source?: DataSource
  flagSection?: FlagSection
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h3 className="text-sm font-semibold text-card-foreground">{title}</h3>
        {source && <FreshnessBadge source={source} size="sm" />}
      </div>
      <div className="flex items-center gap-2">
        {flagSection && <FlagButton section={flagSection} />}
        {onCustomize && (
          <button
            type="button"
            onClick={onCustomize}
            className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2.5 py-1 text-xs text-muted transition hover:bg-accent hover:text-card-foreground"
            aria-label={`Customize ${title}`}
          >
            <Settings2 className="h-3.5 w-3.5" />
            Customize
          </button>
        )}
      </div>
    </div>
  )
}

export function ShopPage() {
  const { data, isLoading, isError } = useShopMetrics('client-1')
  const prefs = useAppStore((s) => s.shopMetricPrefs)
  const setPrefs = useAppStore((s) => s.setShopMetricPrefs)
  const [openSection, setOpenSection] = useState<SectionKey>(null)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted">Loading...</div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center py-20 text-danger">
        Failed to load shop data. Check the console for details.
      </div>
    )
  }

  const metrics = data ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-foreground">Shop Analytics</h2>
          <p className="text-sm text-muted">
            Overview of shop performance including GMV, orders, and channel breakdown.
          </p>
        </div>
        <ExportButton onClick={() => exportToCsv(metrics, 'shop-analytics')} />
      </div>

      <section className="space-y-3">
        <SectionHeader
          title="Key Metrics"
          onCustomize={() => setOpenSection('kpi')}
          source="shop-daily"
          flagSection="shop-kpis"
        />
        <ShopKpis data={metrics} previousData={[]} />
      </section>

      <section className="space-y-3">
        <SectionHeader
          title="Trends"
          onCustomize={() => setOpenSection('chart')}
          source="shop-daily"
          flagSection="shop-chart"
        />
        <ShopChart data={metrics} />
      </section>

      <section className="space-y-3">
        <SectionHeader
          title="Breakdown"
          onCustomize={() => setOpenSection('channel')}
          source="shop-daily"
          flagSection="shop-channel"
        />
        <ChannelBreakdown data={metrics} />
      </section>

      <section className="space-y-3">
        <SectionHeader title="Daily Metrics" source="shop-daily" flagSection="shop-table" />
        <ShopTable data={metrics} />
      </section>

      <CustomizeMetricsDialog
        open={openSection === 'kpi'}
        onClose={() => setOpenSection(null)}
        title="Customize KPIs"
        description="Pick which KPI cards appear in the Key Metrics row. Drag to reorder."
        options={SHOP_METRIC_CATALOG.map((m) => ({ key: m.key, label: m.label }))}
        selected={prefs.kpi}
        defaults={DEFAULT_KPI_METRICS}
        minSelection={1}
        maxSelection={12}
        onSave={(next) => setPrefs({ kpi: next as typeof prefs.kpi })}
      />

      <CustomizeMetricsDialog
        open={openSection === 'chart'}
        onClose={() => setOpenSection(null)}
        title="Customize Trend Tabs"
        description="Pick which chart tabs appear."
        options={CHART_TAB_CATALOG.map((t) => ({ key: t.key, label: t.label }))}
        selected={prefs.chart}
        defaults={DEFAULT_CHART_TABS}
        minSelection={1}
        onSave={(next) => setPrefs({ chart: next as typeof prefs.chart })}
      />

      <CustomizeMetricsDialog
        open={openSection === 'channel'}
        onClose={() => setOpenSection(null)}
        title="Customize Breakdown Sections"
        description="Pick which breakdown cards appear."
        options={CHANNEL_SECTION_CATALOG.map((c) => ({ key: c.key, label: c.label }))}
        selected={prefs.channel}
        defaults={DEFAULT_CHANNEL_SECTIONS}
        minSelection={1}
        onSave={(next) => setPrefs({ channel: next as typeof prefs.channel })}
      />
    </div>
  )
}
