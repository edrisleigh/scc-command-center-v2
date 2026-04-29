import { useState } from 'react'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { useLaunchScenarios, useCreateLaunchScenario } from '@/modules/launch/hooks'
import { computeScenario } from '@/modules/launch/calc'
import { SCENARIO_LABELS } from '@/modules/launch/constants'
import { NewScenarioDialog } from './new-scenario-dialog'
import { formatCurrency } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import type { LaunchScenario, ScenarioKey } from '@/modules/launch/types'

export function LaunchListPage() {
  const { orgSlug } = useParams({ from: '/$orgSlug/launch-scenarios/' })
  const navigate = useNavigate()
  const { data, isLoading, isError } = useLaunchScenarios(orgSlug)
  const create = useCreateLaunchScenario()
  const [creating, setCreating] = useState(false)

  const scenarios = data ?? []

  const projectedNet = (s: LaunchScenario) => {
    const key: ScenarioKey = s.chosenScenarioKey ?? 'balanced'
    return computeScenario(s.scenarios[key], s.sharedInputs).totals.netProfit
  }

  const handleCreate = (input: { prospectName: string; name: string }) => {
    create.mutate(
      { orgSlug, prospectName: input.prospectName, name: input.name },
      {
        onSuccess: (created) => {
          setCreating(false)
          navigate({
            to: '/$orgSlug/launch-scenarios/$scenarioId',
            params: { orgSlug, scenarioId: created.id },
          })
        },
      },
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-6">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold tracking-tight text-primary">SCC</span>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span>/</span>
            <span className="capitalize">{orgSlug}</span>
            <span>/</span>
            <span className="font-medium text-card-foreground">Launch Scenarios</span>
          </div>
        </div>
        <Link to="/$orgSlug/overview" params={{ orgSlug }} className="text-sm font-medium text-primary hover:underline">
          ← Agency Overview
        </Link>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8 space-y-6">
      {isLoading ? (
        <div className="py-20 text-center text-muted">Loading…</div>
      ) : isError ? (
        <div className="py-10 text-center text-danger">Couldn't load scenarios.</div>
      ) : (
        <>
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Launch Scenarios</h1>
          <p className="text-sm text-muted">
            {scenarios.length === 0
              ? 'No launch scenarios yet'
              : `${scenarios.filter((s) => s.status === 'draft').length} drafts · ${scenarios.filter((s) => s.status === 'locked').length} locked`}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="inline-flex items-center gap-1.5 rounded-md border border-primary/40 bg-primary/15 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/25"
        >
          <Plus className="h-4 w-4" /> New launch scenario
        </button>
      </header>

      {scenarios.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <p className="text-sm text-muted">
            No launch scenarios yet — create your first one to start modeling a brand launch.
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-wide text-muted bg-accent/30">
                <th className="text-left p-3 font-medium">Brand / Prospect</th>
                <th className="text-left p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium">Chosen scenario</th>
                <th className="text-right p-3 font-medium">Projected 6mo profit</th>
                <th className="text-left p-3 font-medium">Last updated</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s) => (
                <tr key={s.id} className="border-t border-border/50 hover:bg-accent/10">
                  <td className="p-3">
                    <div className="font-medium text-card-foreground">{s.name}</div>
                    <div className="text-[11px] text-muted">
                      {s.clientSlug ? `client · /${orgSlug}/${s.clientSlug}` : 'prospect'}
                    </div>
                  </td>
                  <td className="p-3">
                    <span className={
                      s.status === 'locked'
                        ? 'rounded bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary'
                        : 'rounded bg-warning/15 px-2 py-0.5 text-[10px] font-semibold uppercase text-warning'
                    }>
                      {s.status}
                    </span>
                  </td>
                  <td className="p-3 text-card-foreground">
                    {s.chosenScenarioKey ? SCENARIO_LABELS[s.chosenScenarioKey] : <span className="text-muted">— not picked —</span>}
                  </td>
                  <td className="p-3 text-right tabular-nums">
                    {formatCurrency(projectedNet(s))}
                    {!s.chosenScenarioKey && <span className="ml-1 text-[10px] text-muted">(if Balanced)</span>}
                  </td>
                  <td className="p-3 text-muted">{formatDistanceToNow(new Date(s.updatedAt), { addSuffix: true })}</td>
                  <td className="p-3 text-right">
                    <Link
                      to="/$orgSlug/launch-scenarios/$scenarioId"
                      params={{ orgSlug, scenarioId: s.id }}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Open →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <NewScenarioDialog
        open={creating}
        busy={create.isPending}
        onCancel={() => setCreating(false)}
        onSubmit={handleCreate}
      />
        </>
      )}
      </main>
    </div>
  )
}
