import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { DateRange } from '@/modules/shared/types'

interface AppState {
  sidebarCollapsed: boolean
  dateRange: DateRange
  toggleSidebar: () => void
  setDateRange: (range: DateRange) => void
}

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      dateRange: {
        from: new Date('2025-10-01'),
        to: new Date('2025-10-31'),
      },
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      setDateRange: (dateRange) => set({ dateRange }),
    }),
    {
      name: 'scc-app',
      partialize: (state) => ({ sidebarCollapsed: state.sidebarCollapsed }),
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : noopStorage,
      ),
    },
  ),
)
