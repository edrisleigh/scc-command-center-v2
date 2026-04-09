import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { TimeSeriesChart } from '@/modules/shared/components/time-series-chart'

const mockData = [
  { date: '2025-10-01', gmv: 140000, orders: 2500 },
  { date: '2025-10-02', gmv: 160000, orders: 2800 },
  { date: '2025-10-03', gmv: 150000, orders: 2600 },
]

describe('TimeSeriesChart', () => {
  it('renders the chart title', () => {
    render(<TimeSeriesChart title="GMV Over Time" data={mockData} dataKey="gmv" xAxisKey="date" />)
    expect(screen.getByText('GMV Over Time')).toBeInTheDocument()
  })

  it('renders granularity toggles', () => {
    render(<TimeSeriesChart title="GMV Over Time" data={mockData} dataKey="gmv" xAxisKey="date" />)
    expect(screen.getByText('Daily')).toBeInTheDocument()
    expect(screen.getByText('Weekly')).toBeInTheDocument()
    expect(screen.getByText('Monthly')).toBeInTheDocument()
  })
})
