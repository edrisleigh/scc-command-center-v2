import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ScenarioSummaryCard } from '@/modules/launch/components/scenario-summary-card'
import type { ScenarioOutputs } from '@/modules/launch/types'

const fakeOutputs: ScenarioOutputs = {
  tts: {
    gmv: [], orders: [], cogs: [], shipping: [], productMargin: [],
    creatorCommission: [], platformFee: [], agencyCommission: [],
    contributionMargin: [], contributionPct: [], sampleCost: [],
    platformProfit: [], preRetainerProfit: [], cumulativeInvest: [],
    activeCreators: [], videos: [], videoViews: [], clicks: [],
  },
  dtc: { googleRevenue: [], metaRevenue: [], incrementalRev: [], orders: [], cogs: [], shipping: [], productMargin: [], platformProfit: [] },
  amazon: { revenue: [], orders: [], cogs: [], shipping: [], productMargin: [] },
  netProfit: [-5000, 0, 30000, 60000, 90000, 130000],
  totals: {
    ttsGmv: 1_000_000, ttsOrders: 10_000, videos: 12_000, videoViews: 60_000_000, clicks: 4_000_000,
    dtcRevenue: 900_000, dtcOrders: 9_000,
    amazonRevenue: 300_000, amazonOrders: 3_000,
    netProfit: 305_000,
  },
} as ScenarioOutputs

describe('ScenarioSummaryCard', () => {
  it('renders scenario label, GMV, orders, net profit, contribution %', () => {
    render(
      <ScenarioSummaryCard
        scenarioKey="conservative"
        outputs={fakeOutputs}
        isChosen={false}
        onEdit={() => {}}
        onPick={() => {}}
        contributionPctTotal={0.25}
      />,
    )
    expect(screen.getByText(/Conservative/)).toBeInTheDocument()
    expect(screen.getByText(/\$1\.00M/)).toBeInTheDocument() // ttsGmv 1,000,000
    expect(screen.getByText(/\$305\.0K/)).toBeInTheDocument() // net profit
  })

  it('shows chosen badge when isChosen=true', () => {
    render(
      <ScenarioSummaryCard
        scenarioKey="balanced" outputs={fakeOutputs} isChosen
        onEdit={() => {}} onPick={() => {}} contributionPctTotal={0.3}
      />,
    )
    expect(screen.getByText(/chosen/i)).toBeInTheDocument()
  })

  it('calls onEdit and onPick when buttons clicked', () => {
    const onEdit = vi.fn(); const onPick = vi.fn()
    render(
      <ScenarioSummaryCard
        scenarioKey="aggressive" outputs={fakeOutputs} isChosen={false}
        onEdit={onEdit} onPick={onPick} contributionPctTotal={0.28}
      />,
    )
    fireEvent.click(screen.getByRole('button', { name: /edit/i }))
    fireEvent.click(screen.getByRole('button', { name: /pick/i }))
    expect(onEdit).toHaveBeenCalledOnce()
    expect(onPick).toHaveBeenCalledOnce()
  })
})
