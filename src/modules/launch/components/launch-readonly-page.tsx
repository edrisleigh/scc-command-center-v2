import { Link, useParams } from '@tanstack/react-router'
import { useLaunchScenarioByClient } from '@/modules/launch/hooks'
import { computeAllScenarios } from '@/modules/launch/calc'
import { ScenarioSummaryCard } from './scenario-summary-card'
import { ScenarioComparisonChart } from './scenario-comparison-chart'
import { ScenarioComparisonTable } from './scenario-comparison-table'
import { SCENARIO_KEYS } from '@/modules/launch/constants'
import { useMemo } from 'react'

export function LaunchReadonlyPage() {
  const { orgSlug, clientSlug } = useParams({ from: '/$orgSlug/$clientSlug/launch' })
  const { data, isLoading } = useLaunchScenarioByClient(orgSlug, clientSlug)

  const outputs = useMemo(() => (data ? computeAllScenarios(data) : null), [data])

  if (isLoading) return <div className="py-20 text-center text-muted">Loading…</div>

  if (!data || !outputs) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
        <p className="text-sm text-muted">
          No locked launch plan for this client yet.{' '}
          <Link to="/$orgSlug/launch-scenarios" params={{ orgSlug }} className="text-primary hover:underline">
            Open Launch Scenarios →
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-bold text-foreground">Launch Plan</h1>
        <p className="text-sm text-muted">
          {data.name} ·{' '}
          <Link to="/$orgSlug/launch-scenarios/$scenarioId" params={{ orgSlug, scenarioId: data.id }} className="text-primary hover:underline">
            View full plan →
          </Link>
        </p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SCENARIO_KEYS.map((k) => (
          <ScenarioSummaryCard
            key={k}
            scenarioKey={k}
            outputs={outputs[k]}
            isChosen={data.chosenScenarioKey === k}
            contributionPctTotal={
              outputs[k].totals.ttsGmv === 0
                ? 0
                : outputs[k].tts.contributionMargin.reduce((a, b) => a + b, 0) / outputs[k].totals.ttsGmv
            }
            onEdit={() => {}}
            onPick={() => {}}
          />
        ))}
      </div>

      <ScenarioComparisonChart outputs={outputs} chosenScenarioKey={data.chosenScenarioKey} />
      <ScenarioComparisonTable outputs={outputs} />
    </div>
  )
}
