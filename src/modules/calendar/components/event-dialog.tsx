import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { format } from 'date-fns'
import {
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from '@/modules/shared/components/dialog'
import type {
  CalendarEvent,
  CalendarEventInput,
  CalendarEventType,
} from '@/modules/calendar/types'
import { cn } from '@/lib/utils'

interface EventDialogProps {
  open: boolean
  onClose: () => void
  event?: CalendarEvent | null
  initialDate?: string
  onSubmit: (input: CalendarEventInput) => Promise<void> | void
  onDelete?: () => Promise<void> | void
}

const TYPE_OPTIONS: Array<{ value: CalendarEventType; label: string }> = [
  { value: 'campaign', label: 'Campaign' },
  { value: 'launch', label: 'Launch' },
  { value: 'tt_promo', label: 'TT Promo' },
  { value: 'internal', label: 'Internal' },
]

const EMPTY: CalendarEventInput = {
  title: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  type: 'campaign',
  owner: '',
  notes: '',
}

export function EventDialog({
  open,
  onClose,
  event,
  initialDate,
  onSubmit,
  onDelete,
}: EventDialogProps) {
  const isEdit = Boolean(event)
  const [form, setForm] = useState<CalendarEventInput>(EMPTY)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    if (event) {
      setForm({
        title: event.title,
        date: event.date,
        type: event.type,
        owner: event.owner,
        notes: event.notes,
      })
    } else {
      setForm({ ...EMPTY, date: initialDate ?? EMPTY.date })
    }
  }, [open, event, initialDate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Title is required')
      return
    }
    if (!form.date) {
      toast.error('Date is required')
      return
    }
    setSubmitting(true)
    try {
      await onSubmit({
        title: form.title.trim(),
        date: form.date,
        type: form.type,
        owner: form.owner.trim(),
        notes: form.notes.trim(),
      })
      toast.success(isEdit ? 'Event updated' : 'Event added')
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save event')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onClose={onClose} size="md" aria-label={isEdit ? 'Edit event' : 'Add event'}>
      <form onSubmit={handleSubmit}>
        <DialogHeader
          title={isEdit ? 'Edit event' : 'Add event'}
          description={isEdit ? 'Update event details' : 'Create a new calendar event'}
          onClose={onClose}
        />
        <DialogBody className="space-y-4">
          <Field label="Title">
            <input
              type="text"
              data-autofocus
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Q2 Hero Product Launch"
              className={inputClass}
              required
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date">
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                className={inputClass}
                required
              />
            </Field>
            <Field label="Type">
              <select
                value={form.type}
                onChange={(e) =>
                  setForm((f) => ({ ...f, type: e.target.value as CalendarEventType }))
                }
                className={inputClass}
              >
                {TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Owner">
            <input
              type="text"
              value={form.owner}
              onChange={(e) => setForm((f) => ({ ...f, owner: e.target.value }))}
              placeholder="e.g. ACT Team"
              className={inputClass}
            />
          </Field>
          <Field label="Notes">
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              className={cn(inputClass, 'resize-y')}
              placeholder="Optional details about this event"
            />
          </Field>
        </DialogBody>
        <DialogFooter>
          {isEdit && onDelete && (
            <button
              type="button"
              onClick={async () => {
                if (!confirm('Delete this event? This cannot be undone.')) return
                try {
                  await onDelete()
                  toast.success('Event deleted')
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
            {submitting ? 'Saving...' : isEdit ? 'Save changes' : 'Add event'}
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
