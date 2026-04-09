import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KpiCard } from '@/modules/shared/components/kpi-card'

describe('KpiCard', () => {
  it('renders label and formatted currency value', () => {
    render(<KpiCard label="GMV" value={4877430} format="currency" />)
    expect(screen.getByText('GMV')).toBeInTheDocument()
    expect(screen.getByText('$4.88M')).toBeInTheDocument()
  })

  it('renders percent format', () => {
    render(<KpiCard label="CVR" value={0.0317} format="percent" />)
    expect(screen.getByText('3.2%')).toBeInTheDocument()
  })

  it('renders number format', () => {
    render(<KpiCard label="Orders" value={89714} format="number" />)
    expect(screen.getByText('89,714')).toBeInTheDocument()
  })

  it('shows positive change indicator', () => {
    render(<KpiCard label="GMV" value={4877430} previousValue={3351178} format="currency" />)
    expect(screen.getByText(/45\.5%/)).toBeInTheDocument()
  })

  it('shows negative change indicator', () => {
    render(<KpiCard label="GMV" value={2894496} previousValue={3351178} format="currency" />)
    expect(screen.getByText(/13\.6%/)).toBeInTheDocument()
  })

  it('does not show change when previousValue is null', () => {
    render(<KpiCard label="GMV" value={4877430} previousValue={null} format="currency" />)
    expect(screen.queryByText(/%/)).not.toBeInTheDocument()
  })
})
