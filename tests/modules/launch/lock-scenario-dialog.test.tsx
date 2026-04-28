import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LockScenarioDialog } from '@/modules/launch/components/lock-scenario-dialog'

describe('LockScenarioDialog', () => {
  it('shows the chosen scenario label', () => {
    render(
      <LockScenarioDialog
        open
        chosenScenarioKey="balanced"
        onConfirm={() => {}}
        onCancel={() => {}}
      />,
    )
    expect(screen.getByText(/Balanced/)).toBeInTheDocument()
  })

  it('calls onConfirm when Lock plan clicked', () => {
    const onConfirm = vi.fn()
    render(
      <LockScenarioDialog open chosenScenarioKey="aggressive" onConfirm={onConfirm} onCancel={() => {}} />,
    )
    fireEvent.click(screen.getByRole('button', { name: /lock plan/i }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })

  it('calls onCancel when Cancel clicked', () => {
    const onCancel = vi.fn()
    render(
      <LockScenarioDialog open chosenScenarioKey="conservative" onConfirm={() => {}} onCancel={onCancel} />,
    )
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('renders nothing when open=false', () => {
    const { container } = render(
      <LockScenarioDialog open={false} chosenScenarioKey="balanced" onConfirm={() => {}} onCancel={() => {}} />,
    )
    expect(container).toBeEmptyDOMElement()
  })
})
