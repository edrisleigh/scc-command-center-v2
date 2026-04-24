import { useState, useMemo } from 'react'
import { formatDistanceToNow, parseISO, format } from 'date-fns'
import { toast } from 'sonner'
import { AlertTriangle, Flag as FlagIcon, Circle, Clock, CheckCircle2, Trash2 } from 'lucide-react'
import { KpiCard } from '@/modules/shared/components/kpi-card'
import {
  useFlags,
  useUpdateFlagStatus,
  useAddFlagComment,
  useAssignFlag,
  useDeleteFlag,
} from '@/modules/flags/hooks'
import { FLAG_SECTION_LABELS, type Flag, type FlagStatus } from '@/modules/flags/types'
import { useCurrentUser } from '@/modules/shared/hooks/use-current-user'
import { cn } from '@/lib/utils'

const STATUS_LABELS: Record<FlagStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  resolved: 'Resolved',
}

const STATUS_STYLES: Record<FlagStatus, string> = {
  open: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
  in_progress: 'border-sky-500/30 bg-sky-500/10 text-sky-400',
  resolved: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
}

const STATUS_ICONS: Record<FlagStatus, typeof Circle> = {
  open: Circle,
  in_progress: Clock,
  resolved: CheckCircle2,
}

const PRIORITY_STYLES: Record<Flag['priority'], string> = {
  low: 'text-muted',
  medium: 'text-amber-400',
  high: 'text-red-400',
}

export function FlagsPage() {
  const clientId = 'client-1'
  const { data: flags, isLoading } = useFlags(clientId)
  const user = useCurrentUser()
  const canManage = user.role === 'admin'

  const updateStatus = useUpdateFlagStatus(clientId)
  const assign = useAssignFlag(clientId)
  const addComment = useAddFlagComment(clientId)
  const deleteFlag = useDeleteFlag(clientId)

  const [filter, setFilter] = useState<FlagStatus | 'all'>('all')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [commentDraft, setCommentDraft] = useState('')

  const allFlags = flags ?? []

  const counts = useMemo(
    () => ({
      open: allFlags.filter((f) => f.status === 'open').length,
      in_progress: allFlags.filter((f) => f.status === 'in_progress').length,
      resolved: allFlags.filter((f) => f.status === 'resolved').length,
      total: allFlags.length,
    }),
    [allFlags],
  )

  const visibleFlags = useMemo(() => {
    const sorted = [...allFlags].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    if (filter === 'all') return sorted
    return sorted.filter((f) => f.status === filter)
  }, [allFlags, filter])

  const selected = selectedId ? allFlags.find((f) => f.id === selectedId) ?? null : null

  const handleClaim = async (id: string) => {
    try {
      await assign.mutateAsync({ id, assignee: user.name })
      await updateStatus.mutateAsync({ id, status: 'in_progress' })
      toast.success('Flag claimed')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to claim')
    }
  }

  const handleResolve = async (id: string) => {
    try {
      await updateStatus.mutateAsync({ id, status: 'resolved' })
      toast.success('Flag resolved')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to resolve')
    }
  }

  const handleReopen = async (id: string) => {
    try {
      await updateStatus.mutateAsync({ id, status: 'open' })
      toast.success('Flag reopened')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to reopen')
    }
  }

  const handleAddComment = async (id: string) => {
    const body = commentDraft.trim()
    if (!body) return
    try {
      await addComment.mutateAsync({ id, body })
      setCommentDraft('')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to post comment')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this flag? This cannot be undone.')) return
    try {
      await deleteFlag.mutateAsync(id)
      if (selectedId === id) setSelectedId(null)
      toast.success('Flag deleted')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted">Loading...</div>
    )
  }

  const filterTabs: { key: FlagStatus | 'all'; label: string; count: number }[] = [
    { key: 'all', label: 'All', count: counts.total },
    { key: 'open', label: 'Open', count: counts.open },
    { key: 'in_progress', label: 'In Progress', count: counts.in_progress },
    { key: 'resolved', label: 'Resolved', count: counts.resolved },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Flags</h2>
        <p className="text-sm text-muted">
          Issues flagged by staff and clients. Claim, comment, and resolve as data is fixed.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="Total" value={counts.total} format="number" />
        <KpiCard label="Open" value={counts.open} format="number" />
        <KpiCard label="In Progress" value={counts.in_progress} format="number" />
        <KpiCard label="Resolved" value={counts.resolved} format="number" />
      </div>

      <div className="flex gap-1 border-b border-border">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setFilter(tab.key)
              setSelectedId(null)
            }}
            className={cn(
              'flex items-center gap-2 rounded-t-md px-4 py-2 text-sm font-medium transition-colors',
              filter === tab.key
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:text-card-foreground',
            )}
          >
            {tab.label}
            <span className="rounded-full bg-accent px-1.5 text-[10px] text-muted">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <div className="rounded-lg border border-border bg-card">
          {visibleFlags.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-12 text-muted">
              <FlagIcon className="h-8 w-8" />
              <p className="text-sm">No flags in this view.</p>
            </div>
          ) : (
            <ul className="divide-y divide-border">
              {visibleFlags.map((f) => {
                const StatusIcon = STATUS_ICONS[f.status]
                const isActive = selectedId === f.id
                return (
                  <li key={f.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(f.id)}
                      className={cn(
                        'flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-accent/40',
                        isActive && 'bg-accent/50',
                      )}
                    >
                      <StatusIcon
                        className={cn(
                          'mt-0.5 h-4 w-4 shrink-0',
                          f.status === 'open' && 'text-amber-400',
                          f.status === 'in_progress' && 'text-sky-400',
                          f.status === 'resolved' && 'text-emerald-400',
                        )}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <span className="truncate text-sm font-medium text-card-foreground">
                            {FLAG_SECTION_LABELS[f.section]}
                          </span>
                          <span
                            className={cn(
                              'text-[10px] font-semibold uppercase',
                              PRIORITY_STYLES[f.priority],
                            )}
                          >
                            {f.priority}
                          </span>
                        </div>
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted">
                          {f.description}
                        </p>
                        <p className="mt-1 text-[10px] text-muted">
                          {f.createdBy} · {formatDistanceToNow(parseISO(f.createdAt), { addSuffix: true })}
                          {f.assignee && ` · assigned to ${f.assignee}`}
                        </p>
                      </div>
                    </button>
                  </li>
                )
              })}
            </ul>
          )}
        </div>

        {selected && (
          <div className="rounded-lg border border-border bg-card p-4 lg:sticky lg:top-4 lg:self-start">
            <div className="mb-3 flex items-start justify-between gap-2">
              <div>
                <h3 className="text-sm font-semibold text-card-foreground">
                  {FLAG_SECTION_LABELS[selected.section]}
                </h3>
                <p className="mt-0.5 text-[10px] text-muted">
                  Flagged by {selected.createdBy} ·{' '}
                  {format(parseISO(selected.createdAt), 'MMM d, yyyy h:mm a')}
                </p>
              </div>
              <span
                className={cn(
                  'rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase',
                  STATUS_STYLES[selected.status],
                )}
              >
                {STATUS_LABELS[selected.status]}
              </span>
            </div>

            {selected.dataPointRef && (
              <div className="mb-3 rounded border border-border bg-background/40 px-2 py-1 text-[11px] text-muted">
                Ref: <span className="text-card-foreground">{selected.dataPointRef}</span>
              </div>
            )}

            <div className="mb-3 flex items-center gap-2 text-[11px]">
              <span className="text-muted">Priority:</span>
              <span className={cn('font-semibold uppercase', PRIORITY_STYLES[selected.priority])}>
                {selected.priority}
              </span>
            </div>

            <p className="mb-4 whitespace-pre-wrap rounded border border-border bg-background/40 p-2 text-xs text-card-foreground">
              {selected.description}
            </p>

            {canManage && (
              <div className="mb-4 flex flex-wrap gap-2">
                {selected.status === 'open' && (
                  <button
                    type="button"
                    onClick={() => handleClaim(selected.id)}
                    className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground transition hover:bg-primary/90"
                  >
                    Claim
                  </button>
                )}
                {selected.status === 'in_progress' && (
                  <button
                    type="button"
                    onClick={() => handleResolve(selected.id)}
                    className="rounded-md bg-emerald-500 px-3 py-1 text-xs font-medium text-white transition hover:bg-emerald-600"
                  >
                    Mark resolved
                  </button>
                )}
                {selected.status === 'resolved' && (
                  <button
                    type="button"
                    onClick={() => handleReopen(selected.id)}
                    className="rounded-md border border-border bg-background px-3 py-1 text-xs text-card-foreground transition hover:bg-accent"
                  >
                    Reopen
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => handleDelete(selected.id)}
                  className="ml-auto flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-xs text-muted transition hover:border-red-500/40 hover:text-red-400"
                  aria-label="Delete flag"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            )}

            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                Comments ({selected.comments.length})
              </p>
              <div className="space-y-2">
                {selected.comments.length === 0 ? (
                  <p className="text-[11px] italic text-muted">No comments yet.</p>
                ) : (
                  selected.comments.map((c) => (
                    <div key={c.id} className="rounded border border-border bg-background/40 p-2">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="text-[11px] font-semibold text-card-foreground">
                          {c.author}
                        </span>
                        <span className="text-[10px] text-muted">
                          {formatDistanceToNow(parseISO(c.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="whitespace-pre-wrap text-xs text-card-foreground">
                        {c.body}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-3 space-y-2">
                <textarea
                  value={commentDraft}
                  onChange={(e) => setCommentDraft(e.target.value)}
                  placeholder="Add a comment…"
                  rows={2}
                  className="w-full rounded border border-border bg-background px-2 py-1 text-xs text-card-foreground placeholder:text-muted focus:border-primary focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleAddComment(selected.id)}
                  disabled={addComment.isPending || !commentDraft.trim()}
                  className="rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
                >
                  {addComment.isPending ? 'Posting…' : 'Post comment'}
                </button>
              </div>
            </div>
          </div>
        )}

        {!selected && visibleFlags.length > 0 && (
          <div className="flex items-center justify-center rounded-lg border border-dashed border-border bg-card/50 p-8 text-xs text-muted">
            <AlertTriangle className="mr-2 h-4 w-4" /> Select a flag to view details.
          </div>
        )}
      </div>
    </div>
  )
}
