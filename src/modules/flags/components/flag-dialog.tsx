import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { Dialog, DialogHeader, DialogBody, DialogFooter } from '@/modules/shared/components/dialog'
import { useCreateFlag } from '@/modules/flags/hooks'
import {
  FLAG_SECTION_LABELS,
  type FlagPriority,
  type FlagSection,
} from '@/modules/flags/types'

interface FlagDialogProps {
  open: boolean
  onClose: () => void
  section: FlagSection
  dataPointRef?: string
  clientId?: string
}

const PRIORITIES: { value: FlagPriority; label: string }[] = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

export function FlagDialog({
  open,
  onClose,
  section,
  dataPointRef,
  clientId = 'client-1',
}: FlagDialogProps) {
  const create = useCreateFlag(clientId)
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<FlagPriority>('medium')

  useEffect(() => {
    if (!open) {
      setDescription('')
      setPriority('medium')
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!description.trim()) return
    try {
      await create.mutateAsync({
        section,
        dataPointRef,
        description: description.trim(),
        priority,
      })
      toast.success('Flag submitted')
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit flag')
    }
  }

  return (
    <Dialog open={open} onClose={onClose} size="md" aria-label="Flag an issue">
      <form onSubmit={handleSubmit}>
        <DialogHeader
          title="Flag an issue"
          description={`Section: ${FLAG_SECTION_LABELS[section]}`}
          onClose={onClose}
        />
        <DialogBody className="space-y-4">
          {dataPointRef && (
            <div className="rounded border border-border bg-background/40 px-3 py-2 text-xs text-muted">
              Reference: <span className="text-card-foreground">{dataPointRef}</span>
            </div>
          )}

          <label className="block">
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
              What's wrong?
            </span>
            <textarea
              data-autofocus
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what looks incorrect or missing..."
              rows={4}
              required
              className="w-full rounded border border-border bg-background px-3 py-2 text-sm text-card-foreground placeholder:text-muted focus:border-primary focus:outline-none"
            />
          </label>

          <div>
            <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
              Priority
            </span>
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setPriority(p.value)}
                  className={`rounded-md border px-3 py-1 text-xs transition ${
                    priority === p.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border bg-background text-muted hover:text-card-foreground'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>
        </DialogBody>
        <DialogFooter>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border bg-background px-3 py-1.5 text-xs text-card-foreground transition hover:bg-accent"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={create.isPending || !description.trim()}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            {create.isPending ? 'Submitting…' : 'Submit flag'}
          </button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}
