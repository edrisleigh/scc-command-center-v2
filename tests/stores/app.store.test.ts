import { describe, it, expect, beforeEach } from 'vitest'
import { useAppStore } from '@/stores/app.store'

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState({
      sidebarCollapsed: false,
      dateRange: {
        from: new Date('2025-11-01'),
        to: new Date('2025-11-30'),
      },
    })
  })

  it('has default date range', () => {
    const { dateRange } = useAppStore.getState()
    expect(dateRange.from).toBeInstanceOf(Date)
    expect(dateRange.to).toBeInstanceOf(Date)
  })

  it('updates date range', () => {
    const newRange = { from: new Date('2025-10-01'), to: new Date('2025-10-31') }
    useAppStore.getState().setDateRange(newRange)
    const { dateRange } = useAppStore.getState()
    expect(dateRange.from).toEqual(new Date('2025-10-01'))
    expect(dateRange.to).toEqual(new Date('2025-10-31'))
  })

  it('toggles sidebar', () => {
    expect(useAppStore.getState().sidebarCollapsed).toBe(false)
    useAppStore.getState().toggleSidebar()
    expect(useAppStore.getState().sidebarCollapsed).toBe(true)
  })
})
