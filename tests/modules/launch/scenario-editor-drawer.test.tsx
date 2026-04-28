import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ScenarioEditorDrawer } from '@/modules/launch/components/scenario-editor-drawer'
import { defaultScenarioInputs, defaultSharedInputs } from '@/modules/launch/defaults'

describe('ScenarioEditorDrawer', () => {
  it('renders the four tabs and the per-month grid for the active tab', () => {
    render(
      <ScenarioEditorDrawer
        scenarioKey="conservative"
        inputs={defaultScenarioInputs.conservative}
        shared={defaultSharedInputs}
        open
        onChange={() => {}}
        onClose={() => {}}
        onResetToTemplate={() => {}}
        onApply={() => {}}
      />,
    )
    expect(screen.getByRole('tab', { name: /tiktok shop/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /dtc/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /amazon/i })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: /outputs/i })).toBeInTheDocument()
    // 6 month columns
    expect(screen.getAllByText(/^M[1-6]$/i).length).toBeGreaterThanOrEqual(6)
  })

  it('emits onChange when a TTS ROAS cell is edited', () => {
    const onChange = vi.fn()
    render(
      <ScenarioEditorDrawer
        scenarioKey="conservative"
        inputs={defaultScenarioInputs.conservative}
        shared={defaultSharedInputs}
        open
        onChange={onChange}
        onClose={() => {}}
        onResetToTemplate={() => {}}
        onApply={() => {}}
      />,
    )
    // The first ROAS cell input
    const inputs = screen.getAllByLabelText(/ROAS M1/i)
    fireEvent.change(inputs[0], { target: { value: '0.9' } })
    expect(onChange).toHaveBeenCalled()
    const updated = onChange.mock.calls[0][0]
    expect(updated.tts.roas[0]).toBeCloseTo(0.9)
  })

  it('does not render when open is false', () => {
    const { container } = render(
      <ScenarioEditorDrawer
        scenarioKey="conservative"
        inputs={defaultScenarioInputs.conservative}
        shared={defaultSharedInputs}
        open={false}
        onChange={() => {}}
        onClose={() => {}}
        onResetToTemplate={() => {}}
        onApply={() => {}}
      />,
    )
    expect(container).toBeEmptyDOMElement()
  })
})
