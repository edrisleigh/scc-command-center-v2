import { useMemo, useState } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { useLaunchScenario, useSaveLaunchScenario, useLockLaunchScenario } from '@/modules/launch/hooks'
import { computeAllScenarios } from '@/modules/launch/calc'
import { defaultScenarioInputs } from '@/modules/launch/defaults'
import { SCENARIO_KEYS, SCENARIO_LABELS } from '@/modules/launch/constants'
import { SharedInputsPanel } from './shared-inputs-panel'
import { ScenarioSummaryCard } from './scenario-summary-card'
import { ScenarioComparisonChart } from './scenario-comparison-chart'
import { ScenarioComparisonTable } from './scenario-comparison-table'
import { ScenarioEditorDrawer } from './scenario-editor-drawer'
import { LockScenarioDialog } from './lock-scenario-dialog'
import { ExportButton } from '@/modules/shared/components/export-button'
import { exportToCsv } from '@/lib/export'
import type { LaunchScenario, ScenarioKey, ScenarioInputs } from '@/modules/launch/types'

export function LaunchDetailPage() {
  const { orgSlug, scenarioId } = useParams({ from: '/$orgSlug/launch-scenarios/$scenarioId' })
  const { data, isLoading, isError } = useLaunchScenario(scenarioId)
  const save = useSaveLaunchScenario()
  const lock = useLockLaunchScenario()

  const [draft, setDraft] = useState<LaunchScenario | null>(null)
  const [editing, setEditing] = useState<ScenarioKey | null>(null)
  const [confirmingLock, setConfirmingLock] = useState(false)

  const current = draft ?? data ?? null
  const dirty = draft !== null && data !== null && JSON.stringify(draft) !== JSON.stringify(data)
  const isLocked = current?.status === 'locked'

  const outputs = useMemo(
    () => (current ? computeAllScenarios(current) : null),
    [current],
  )

  if (isLoading) {
    return (
      <AgencyShell orgSlug={orgSlug} title="Loading…">
        <div className="py-20 text-center text-muted">Loading…</div>
      </AgencyShell>
    )
  }
  if (isError || !current || !outputs) {
    return (
      <AgencyShell orgSlug={orgSlug} title="Launch Scenario">
        <div className="rounded-md border border-danger/40 bg-danger/10 p-4 text-sm text-danger">
          Couldn't load this launch scenario. <button onClick={() => location.reload()} className="underline">Retry</button>
        </div>
      </AgencyShell>
    )
  }

  const updateDoc = (next: LaunchScenario) => setDraft(next)

  const handleSave = () => {
    if (!draft) return
    save.mutate(draft, { onSuccess: (saved) => setDraft(saved) })
  }

  const handlePick = (key: ScenarioKey) => {
    if (isLocked) return
    updateDoc({ ...current, chosenScenarioKey: key })
  }

  const handleApplyEditor = (key: ScenarioKey, next: ScenarioInputs) => {
    updateDoc({
      ...current,
      scenarios: { ...current.scenarios, [key]: next },
    })
  }

  const handleResetToTemplate = (key: ScenarioKey) => {
    updateDoc({
      ...current,
      scenarios: { ...current.scenarios, [key]: structuredClone(defaultScenarioInputs[key]) },
    })
  }

  const handleLockConfirm = () => {
    if (!current.chosenScenarioKey) return
    setConfirmingLock(false)
    lock.mutate({ id: current.id, chosen: current.chosenScenarioKey })
  }

  const handleExportCsv = () => {
    const rows = SCENARIO_KEYS.map((k) => ({
      scenario: SCENARIO_LABELS[k],
      ttsGmv: outputs[k].totals.ttsGmv,
      ttsOrders: outputs[k].totals.ttsOrders,
      videos: outputs[k].totals.videos,
      videoViews: outputs[k].totals.videoViews,
      dtcRevenue: outputs[k].totals.dtcRevenue,
      amazonRevenue: outputs[k].totals.amazonRevenue,
      netProfit: outputs[k].totals.netProfit,
    }))
    exportToCsv(rows, `launch-scenarios-${current.id}`)
  }

  return (
    <AgencyShell orgSlug={orgSlug} title={current.name}>
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">{current.name}</h1>
            <span className={
              current.status === 'locked'
                ? 'rounded bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary'
                : 'rounded bg-warning/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-warning'
            }>
              {current.status}
            </span>
            {dirty && <span className="text-xs text-warning">Unsaved changes</span>}
          </div>
          <p className="text-sm text-muted">
            {current.clientSlug ? `client · /${orgSlug}/${current.clientSlug}` : 'prospect'} · last updated {new Date(current.updatedAt).toLocaleString()}
          </p>
        </div>
        <div className="flex gap-2">
          <ExportButton onClick={handleExportCsv} />
          {!isLocked && dirty && (
            <button
              onClick={handleSave}
              disabled={save.isPending}
              className="rounded-md border border-border bg-accent/40 px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
            >
              Save
            </button>
          )}
          {!isLocked && (
            <button
              onClick={() => setConfirmingLock(true)}
              disabled={!current.chosenScenarioKey || dirty || lock.isPending}
              className="rounded-md border border-primary/40 bg-primary/15 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/25 disabled:opacity-50"
              title={!current.chosenScenarioKey ? 'Pick a scenario first' : dirty ? 'Save changes first' : ''}
            >
              🔒 Lock plan
            </button>
          )}
        </div>
      </header>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">
          Brand economics — shared across all scenarios
        </h2>
        <SharedInputsPanel
          value={current.sharedInputs}
          readOnly={isLocked}
          onChange={(next) => updateDoc({ ...current, sharedInputs: next })}
        />
      </section>

      <section>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted">
          4 launch scenarios — 6-month projections
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {SCENARIO_KEYS.map((k) => (
            <ScenarioSummaryCard
              key={k}
              scenarioKey={k}
              outputs={outputs[k]}
              isChosen={current.chosenScenarioKey === k}
              contributionPctTotal={
                outputs[k].totals.ttsGmv === 0
                  ? 0
                  : sumArr(outputs[k].tts.contributionMargin) / outputs[k].totals.ttsGmv
              }
              onEdit={() => !isLocked && setEditing(k)}
              onPick={() => handlePick(k)}
            />
          ))}
        </div>
      </section>

      <ScenarioComparisonChart outputs={outputs} chosenScenarioKey={current.chosenScenarioKey} />
      <ScenarioComparisonTable outputs={outputs} />

      {editing && (
        <ScenarioEditorDrawer
          scenarioKey={editing}
          inputs={current.scenarios[editing]}
          shared={current.sharedInputs}
          open={!!editing}
          onChange={(next) => handleApplyEditor(editing, next)}
          onClose={() => setEditing(null)}
          onResetToTemplate={() => handleResetToTemplate(editing)}
          onApply={() => setEditing(null)}
        />
      )}

      <LockScenarioDialog
        open={confirmingLock && !!current.chosenScenarioKey}
        chosenScenarioKey={current.chosenScenarioKey ?? 'conservative'}
        onCancel={() => setConfirmingLock(false)}
        onConfirm={handleLockConfirm}
      />
    </AgencyShell>
  )
}

function AgencyShell({ orgSlug, title, children }: { orgSlug: string; title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-6">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold tracking-tight text-primary">SCC</span>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span>/</span>
            <span className="capitalize">{orgSlug}</span>
            <span>/</span>
            <Link to="/$orgSlug/launch-scenarios" params={{ orgSlug }} className="hover:text-card-foreground">
              Launch Scenarios
            </Link>
            <span>/</span>
            <span className="font-medium text-card-foreground">{title}</span>
          </div>
        </div>
        <Link to="/$orgSlug/launch-scenarios" params={{ orgSlug }} className="text-sm font-medium text-primary hover:underline">
          ← Launch Scenarios
        </Link>
      </header>
      <main className="mx-auto max-w-6xl px-6 py-8 space-y-6">{children}</main>
    </div>
  )
}

function sumArr(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0)
}
