import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { GripVertical, Check } from 'lucide-react'
import { Dialog, DialogHeader, DialogBody, DialogFooter } from '@/modules/shared/components/dialog'
import { cn } from '@/lib/utils'

interface Option {
  key: string
  label: string
}

interface CustomizeMetricsDialogProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  options: Option[]
  selected: string[]
  defaults: string[]
  minSelection?: number
  maxSelection?: number
  onSave: (next: string[]) => void
}

export function CustomizeMetricsDialog({
  open,
  onClose,
  title,
  description,
  options,
  selected,
  defaults,
  minSelection = 1,
  maxSelection,
  onSave,
}: CustomizeMetricsDialogProps) {
  const [draft, setDraft] = useState<string[]>(selected)

  useEffect(() => {
    if (open) setDraft(selected)
  }, [open, selected])

  const isSelected = (key: string) => draft.includes(key)

  const toggle = (key: string) => {
    setDraft((current) => {
      if (current.includes(key)) {
        if (current.length <= minSelection) {
          toast.error(`At least ${minSelection} must be selected`)
          return current
        }
        return current.filter((k) => k !== key)
      }
      if (maxSelection && current.length >= maxSelection) {
        toast.error(`At most ${maxSelection} can be selected`)
        return current
      }
      return [...current, key]
    })
  }

  const moveUp = (key: string) => {
    setDraft((current) => {
      const idx = current.indexOf(key)
      if (idx <= 0) return current
      const next = [...current]
      ;[next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]
      return next
    })
  }

  const moveDown = (key: string) => {
    setDraft((current) => {
      const idx = current.indexOf(key)
      if (idx < 0 || idx >= current.length - 1) return current
      const next = [...current]
      ;[next[idx + 1], next[idx]] = [next[idx], next[idx + 1]]
      return next
    })
  }

  const resetToDefault = () => setDraft(defaults)

  const handleSave = () => {
    onSave(draft)
    toast.success(`${title} saved`)
    onClose()
  }

  const unselectedOptions = options.filter((o) => !draft.includes(o.key))
  const selectedOptions = draft
    .map((k) => options.find((o) => o.key === k))
    .filter((o): o is Option => Boolean(o))

  return (
    <Dialog open={open} onClose={onClose} size="xl" aria-label={title}>
      <DialogHeader
        title={title}
        description={description ?? `Select which items to display. ${draft.length} selected.`}
        onClose={onClose}
      />
      <DialogBody className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-md border border-border bg-background/40">
          <div className="border-b border-border px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            Available
          </div>
          <div className="max-h-80 space-y-1 overflow-y-auto p-2">
            {options.map((opt) => {
              const selected = isSelected(opt.key)
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => toggle(opt.key)}
                  className={cn(
                    'flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition',
                    selected
                      ? 'bg-primary/10 text-card-foreground'
                      : 'text-muted hover:bg-accent hover:text-card-foreground',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className={cn(
                        'flex h-4 w-4 items-center justify-center rounded border',
                        selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border',
                      )}
                    >
                      {selected && <Check className="h-3 w-3" />}
                    </span>
                    {opt.label}
                  </span>
                </button>
              )
            })}
            {options.length === 0 && (
              <p className="px-3 py-6 text-center text-xs text-muted">No items available.</p>
            )}
          </div>
          {unselectedOptions.length === 0 && (
            <div className="border-t border-border bg-background/30 px-3 py-2 text-[11px] text-muted">
              All items added.
            </div>
          )}
        </div>

        <div className="rounded-md border border-border bg-background/40">
          <div className="flex items-center justify-between border-b border-border px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            <span>Selected ({draft.length})</span>
            <button
              type="button"
              onClick={resetToDefault}
              className="text-[11px] font-medium text-primary hover:underline"
            >
              Reset to default
            </button>
          </div>
          <div className="max-h-80 space-y-1 overflow-y-auto p-2">
            {selectedOptions.map((opt, idx) => (
              <div
                key={opt.key}
                className="group flex items-center justify-between rounded-md border border-border bg-card px-3 py-2 text-sm text-card-foreground"
              >
                <span className="flex items-center gap-2">
                  <GripVertical className="h-3.5 w-3.5 text-muted" />
                  {opt.label}
                </span>
                <span className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => moveUp(opt.key)}
                    disabled={idx === 0}
                    className="rounded px-1.5 py-0.5 text-[11px] text-muted hover:bg-accent hover:text-card-foreground disabled:opacity-30"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={() => moveDown(opt.key)}
                    disabled={idx === selectedOptions.length - 1}
                    className="rounded px-1.5 py-0.5 text-[11px] text-muted hover:bg-accent hover:text-card-foreground disabled:opacity-30"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => toggle(opt.key)}
                    className="rounded px-1.5 py-0.5 text-[11px] text-danger hover:bg-danger/10"
                  >
                    Remove
                  </button>
                </span>
              </div>
            ))}
            {selectedOptions.length === 0 && (
              <p className="px-3 py-6 text-center text-xs text-muted">
                Nothing selected. Pick at least {minSelection}.
              </p>
            )}
          </div>
        </div>
      </DialogBody>
      <DialogFooter>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-border px-3 py-1.5 text-sm text-muted hover:bg-accent hover:text-card-foreground"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSave}
          data-autofocus
          className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Save
        </button>
      </DialogFooter>
    </Dialog>
  )
}
