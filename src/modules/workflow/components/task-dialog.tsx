import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '@/modules/shared/components/dialog'
import type {
  WorkflowTask,
  WorkflowTaskInput,
  WorkflowRole,
  WorkflowFrequency,
} from '@/modules/workflow/types'
import { cn } from '@/lib/utils'

interface TaskDialogProps {
  open: boolean
  onClose: () => void
  task?: WorkflowTask | null
  initialRole?: WorkflowRole
  onSubmit: (input: WorkflowTaskInput) => Promise<void> | void
  onDelete?: () => Promise<void> | void
}

const ROLE_OPTIONS: Array<{ value: WorkflowRole; label: string }> = [
  { value: 'affiliate_comms', label: 'Affiliate Comms' },
  { value: 'media_buyer', label: 'Media Buyer' },
  { value: 'scs', label: 'SCS' },
]

const FREQUENCY_OPTIONS: Array<{ value: WorkflowFrequency; label: string }> = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
]

const DAYS: Array<{ num: number; label: string }> = [
  { num: 1, label: 'Mon' },
  { num: 2, label: 'Tue' },
  { num: 3, label: 'Wed' },
  { num: 4, label: 'Thu' },
  { num: 5, label: 'Fri' },
]

const EMPTY: WorkflowTaskInput = {
  role: 'affiliate_comms',
  taskName: '',
  frequency: 'daily',
  dayOfWeek: [],
  goal: 5,
}

export function TaskDialog({
  open,
  onClose,
  task,
  initialRole,
  onSubmit,
  onDelete,
}: TaskDialogProps) {
  const isEdit = Boolean(task)
  const [form, setForm] = useState<WorkflowTaskInput>(EMPTY)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    if (task) {
      setForm({
        role: task.role,
        taskName: task.taskName,
        frequency: task.frequency,
        dayOfWeek: task.dayOfWeek,
        goal: task.goal,
      })
    } else {
      setForm({ ...EMPTY, role: initialRole ?? EMPTY.role })
    }
  }, [open, task, initialRole])

  const toggleDay = (num: number) => {
    setForm((f) => ({
      ...f,
      dayOfWeek: f.dayOfWeek.includes(num)
        ? f.dayOfWeek.filter((d) => d !== num)
        : [...f.dayOfWeek, num].sort((a, b) => a - b),
    }))
  }

  const handleFrequencyChange = (next: WorkflowFrequency) => {
    setForm((f) => ({
      ...f,
      frequency: next,
      dayOfWeek: next === 'daily' ? [] : f.dayOfWeek,
      goal: next === 'daily' ? 5 : Math.max(1, f.dayOfWeek.length || 1),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.taskName.trim()) {
      toast.error('Task name is required')
      return
    }
    if (form.frequency === 'weekly' && form.dayOfWeek.length === 0) {
      toast.error('Weekly tasks need at least one scheduled day')
      return
    }
    if (form.goal < 1) {
      toast.error('Goal must be at least 1')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit({
        role: form.role,
        taskName: form.taskName.trim(),
        frequency: form.frequency,
        dayOfWeek: form.dayOfWeek,
        goal: form.goal,
      })
      toast.success(isEdit ? 'Task updated' : 'Task added')
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save task')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} size="md" aria-label={isEdit ? 'Edit task' : 'Add task'}>
      <form onSubmit={handleSubmit}>
        <DialogHeader
          title={isEdit ? 'Edit task' : 'Add task'}
          description={isEdit ? 'Update task details' : 'Create a new workflow task'}
          onClose={onClose}
        />
        <DialogBody className="space-y-4">
          <Field label="Task name">
            <input
              type="text"
              data-autofocus
              value={form.taskName}
              onChange={(e) => setForm((f) => ({ ...f, taskName: e.target.value }))}
              placeholder="e.g. Daily shop health check"
              className={inputClass}
              required
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Role">
              <select
                value={form.role}
                onChange={(e) =>
                  setForm((f) => ({ ...f, role: e.target.value as WorkflowRole }))
                }
                className={inputClass}
              >
                {ROLE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Frequency">
              <select
                value={form.frequency}
                onChange={(e) =>
                  handleFrequencyChange(e.target.value as WorkflowFrequency)
                }
                className={inputClass}
              >
                {FREQUENCY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          {form.frequency === 'weekly' && (
            <Field label="Scheduled days">
              <div className="flex gap-2">
                {DAYS.map((d) => {
                  const active = form.dayOfWeek.includes(d.num)
                  return (
                    <button
                      key={d.num}
                      type="button"
                      onClick={() => toggleDay(d.num)}
                      className={cn(
                        'flex h-9 w-12 items-center justify-center rounded-md border text-xs font-medium transition',
                        active
                          ? 'border-primary bg-primary/15 text-primary'
                          : 'border-border text-muted hover:bg-accent hover:text-card-foreground',
                      )}
                    >
                      {d.label}
                    </button>
                  )
                })}
              </div>
            </Field>
          )}

          <Field label={`Goal (completions per week)`}>
            <input
              type="number"
              min={1}
              max={35}
              value={form.goal}
              onChange={(e) => setForm((f) => ({ ...f, goal: Number(e.target.value) }))}
              className={inputClass}
              required
            />
          </Field>
        </DialogBody>
        <DialogFooter>
          {isEdit && onDelete && (
            <button
              type="button"
              onClick={async () => {
                if (!confirm('Delete this task? This cannot be undone.')) return
                try {
                  await onDelete()
                  toast.success('Task deleted')
                  onClose()
                } catch (err) {
                  toast.error(err instanceof Error ? err.message : 'Failed to delete')
                }
              }}
              className="mr-auto rounded-md border border-danger/40 px-3 py-1.5 text-sm text-danger hover:bg-danger/10"
            >
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-border px-3 py-1.5 text-sm text-muted hover:bg-accent hover:text-card-foreground"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Add task'}
          </button>
        </DialogFooter>
      </form>
    </Dialog>
  )
}

const inputClass =
  'w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted focus:border-primary focus:outline-none'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-muted">{label}</span>
      {children}
    </label>
  )
}
