import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataTable, type Column } from '@/modules/shared/components/data-table'

interface TestRow {
  date: string
  gmv: number
  orders: number
}

const columns: Column<TestRow>[] = [
  { key: 'date', header: 'Date' },
  { key: 'gmv', header: 'GMV', format: (v) => `$${(v as number).toLocaleString()}` },
  { key: 'orders', header: 'Orders' },
]

const data: TestRow[] = [
  { date: '2025-10-01', gmv: 140000, orders: 2500 },
  { date: '2025-10-02', gmv: 160000, orders: 2800 },
  { date: '2025-10-03', gmv: 120000, orders: 2200 },
]

describe('DataTable', () => {
  it('renders column headers', () => {
    render(<DataTable columns={columns} data={data} />)
    expect(screen.getByText('Date')).toBeInTheDocument()
    expect(screen.getByText('GMV')).toBeInTheDocument()
    expect(screen.getByText('Orders')).toBeInTheDocument()
  })

  it('renders all rows', () => {
    render(<DataTable columns={columns} data={data} />)
    expect(screen.getByText('2025-10-01')).toBeInTheDocument()
    expect(screen.getByText('2025-10-02')).toBeInTheDocument()
    expect(screen.getByText('2025-10-03')).toBeInTheDocument()
  })

  it('applies format function to values', () => {
    render(<DataTable columns={columns} data={data} />)
    expect(screen.getByText('$140,000')).toBeInTheDocument()
  })

  it('sorts by column when header is clicked', async () => {
    render(<DataTable columns={columns} data={data} />)
    const user = userEvent.setup()
    await user.click(screen.getByText('GMV'))
    const rows = screen.getAllByRole('row')
    expect(rows[1]).toHaveTextContent('160,000')
  })
})
