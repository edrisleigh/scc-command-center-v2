import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { startOfMonth, endOfMonth } from 'date-fns'
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
        from: startOfMonth(new Date()),
        to: endOfMonth(new Date()),
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
