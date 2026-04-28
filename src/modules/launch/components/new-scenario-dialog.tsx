import { useState } from 'react'

interface NewScenarioDialogProps {
  open: boolean
  onSubmit: (input: { prospectName: string; name: string }) => void
  onCancel: () => void
  busy?: boolean
}

export function NewScenarioDialog({ open, onSubmit, onCancel, busy }: NewScenarioDialogProps) {
  const [prospectName, setProspectName] = useState('')
  const [name, setName] = useState('')

  if (!open) return null

  const submit = () => {
    const trimmed = prospectName.trim()
    if (!trimmed) return
    onSubmit({
      prospectName: trimmed,
      name: name.trim() || `${trimmed} Launch`,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-xl border border-border bg-card p-5">
        <h2 className="text-base font-semibold text-card-foreground">New launch scenario</h2>

        <label className="mt-4 block">
          <span className="text-xs uppercase tracking-wide text-muted">Prospect / brand name</span>
          <input
            value={prospectName}
            onChange={(e) => setProspectName(e.target.value)}
            placeholder="e.g. HEYDUDE"
            className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
            autoFocus
          />
        </label>

        <label className="mt-3 block">
          <span className="text-xs uppercase tracking-wide text-muted">Display name (optional)</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="HEYDUDE Q2 2026 Launch"
            className="mt-1 w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </label>

        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onCancel} className="rounded-md border border-border bg-accent/40 px-3 py-1.5 text-xs hover:bg-accent">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!prospectName.trim() || busy}
            className="rounded-md border border-primary/40 bg-primary/15 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/25 disabled:opacity-50"
          >
            Create draft
          </button>
        </div>
      </div>
    </div>
  )
}
