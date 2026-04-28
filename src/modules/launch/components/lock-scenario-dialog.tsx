import type { ScenarioKey } from '@/modules/launch/types'
import { SCENARIO_LABELS } from '@/modules/launch/constants'

interface LockScenarioDialogProps {
  open: boolean
  chosenScenarioKey: ScenarioKey
  onConfirm: () => void
  onCancel: () => void
}

export function LockScenarioDialog({ open, chosenScenarioKey, onConfirm, onCancel }: LockScenarioDialogProps) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-card-foreground">Lock launch plan?</h2>
        <p className="mt-2 text-sm text-muted">
          Lock this launch plan with <strong className="text-card-foreground">{SCENARIO_LABELS[chosenScenarioKey]}</strong> as the chosen scenario?
          Brand inputs and per-month assumptions become read-only. This can't be undone.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-md border border-border bg-accent/40 px-3 py-1.5 text-xs hover:bg-accent">
            Cancel
          </button>
          <button onClick={onConfirm} className="rounded-md border border-primary/40 bg-primary/20 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/30">
            Lock plan
          </button>
        </div>
      </div>
    </div>
  )
}
