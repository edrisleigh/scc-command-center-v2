import { useAppStore } from '@/stores/app.store'
import type { DateRange } from '@/modules/shared/types'

export function useDateRange(): [DateRange, (range: DateRange) => void] {
  const dateRange = useAppStore((s) => s.dateRange)
  const setDateRange = useAppStore((s) => s.setDateRange)
  return [dateRange, setDateRange]
}
