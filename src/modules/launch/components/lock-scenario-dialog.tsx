import type { ScenarioKey } from '@/modules/launch/types'
import { SCENARIO_LABELS } from '@/modules/launch/constants'
import { Dialog, DialogBody, DialogFooter, DialogHeader } from '@/modules/shared/components/dialog'

interface LockScenarioDialogProps {
  open: boolean
  chosenScenarioKey: ScenarioKey
  onConfirm: () => void
  onCancel: () => void
}

export function LockScenarioDialog({ open, chosenScenarioKey, onConfirm, onCancel }: LockScenarioDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} size="md" aria-label="Lock launch plan">
      <DialogHeader title="Lock launch plan?" onClose={onCancel} />
      <DialogBody>
        <p className="text-sm text-muted">
          Lock this launch plan with{' '}
          <strong className="text-card-foreground">{SCENARIO_LABELS[chosenScenarioKey]}</strong>{' '}
          as the chosen scenario? Brand inputs and per-month assumptions become read-only. This can't be undone.
        </p>
      </DialogBody>
      <DialogFooter>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-border bg-accent/40 px-3 py-1.5 text-xs hover:bg-accent"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          data-autofocus
          className="rounded-md border border-primary/40 bg-primary/20 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/30"
        >
          Lock plan
        </button>
      </DialogFooter>
    </Dialog>
  )
}
