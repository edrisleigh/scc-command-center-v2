import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { DateRange } from '@/modules/shared/types'
import {
  DEFAULT_KPI_METRICS,
  DEFAULT_CHART_TABS,
  DEFAULT_CHANNEL_SECTIONS,
  type ShopMetricDefinition,
  type ChartTabDefinition,
  type ChannelSectionDefinition,
} from '@/modules/shop/metric-catalog'

export interface ShopMetricPrefs {
  kpi: Array<ShopMetricDefinition['key']>
  chart: Array<ChartTabDefinition['key']>
  channel: Array<ChannelSectionDefinition['key']>
}

interface AppState {
  sidebarCollapsed: boolean
  dateRange: DateRange
  shopMetricPrefs: ShopMetricPrefs
  toggleSidebar: () => void
  setDateRange: (range: DateRange) => void
  setShopMetricPrefs: (prefs: Partial<ShopMetricPrefs>) => void
}

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}

const defaultShopPrefs: ShopMetricPrefs = {
  kpi: DEFAULT_KPI_METRICS,
  chart: DEFAULT_CHART_TABS,
  channel: DEFAULT_CHANNEL_SECTIONS,
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      dateRange: {
        from: new Date('2026-03-01'),
        to: new Date('2026-04-13'),
      },
      shopMetricPrefs: defaultShopPrefs,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setDateRange: (dateRange) => set({ dateRange }),
      setShopMetricPrefs: (prefs) =>
        set((s) => ({ shopMetricPrefs: { ...s.shopMetricPrefs, ...prefs } })),
    }),
    {
      name: 'scc-app',
      version: 2,
      migrate: (persisted, version) => {
        const prior = (persisted ?? {}) as Partial<AppState>
        if (version < 2) {
          return { ...prior, shopMetricPrefs: defaultShopPrefs } as Partial<AppState>
        }
        return prior as Partial<AppState>
      },
      partialize: (state) => ({
        sidebarCollapsed: state.sidebarCollapsed,
        shopMetricPrefs: state.shopMetricPrefs,
      }),
      merge: (persisted, current) => {
        const p = (persisted as Partial<AppState>) ?? {}
        return {
          ...current,
          sidebarCollapsed: p.sidebarCollapsed ?? current.sidebarCollapsed,
          shopMetricPrefs: {
            kpi: p.shopMetricPrefs?.kpi ?? current.shopMetricPrefs.kpi,
            chart: p.shopMetricPrefs?.chart ?? current.shopMetricPrefs.chart,
            channel: p.shopMetricPrefs?.channel ?? current.shopMetricPrefs.channel,
          },
        }
      },
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : noopStorage,
      ),
    },
  ),
)
