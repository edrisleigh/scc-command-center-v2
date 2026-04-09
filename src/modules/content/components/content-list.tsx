import { useState, useMemo } from 'react'
import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ContentSubmission } from '@/modules/content/types'

interface ContentListProps {
  submissions: ContentSubmission[]
}

type TypeFilter = 'all' | 'paid' | 'free'
type StatusFilter = 'all' | 'submitted' | 'approved' | 'denied' | 'in_progress' | 'completed'

const STATUS_LABELS: Record<ContentSubmission['status'], string> = {
  submitted: 'Submitted',
  approved: 'Approved',
  denied: 'Denied',
  in_progress: 'In Progress',
  completed: 'Completed',
}

const STATUS_CLASSES: Record<ContentSubmission['status'], string> = {
  submitted: 'bg-gray-500/15 text-gray-400',
  approved: 'bg-green-500/15 text-green-400',
  denied: 'bg-red-500/15 text-red-400',
  in_progress: 'bg-blue-500/15 text-blue-400',
  completed: 'bg-emerald-500/15 text-emerald-400',
}

const PAGE_SIZE = 15

export function ContentList({ submissions }: ContentListProps) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    let result = submissions
    if (typeFilter !== 'all') result = result.filter(s => s.type === typeFilter)
    if (statusFilter !== 'all') result = result.filter(s => s.status === statusFilter)
    return result
  }, [submissions, typeFilter, statusFilter])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const typeButtons: { key: TypeFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'paid', label: 'Paid' },
    { key: 'free', label: 'Free' },
  ]

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'all', label: 'All Statuses' },
    { value: 'submitted', label: 'Submitted' },
    { value: 'approved', label: 'Approved' },
    { value: 'denied', label: 'Denied' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
  ]

  function handleTypeFilter(key: TypeFilter) {
    setTypeFilter(key)
    setPage(0)
  }

  function handleStatusFilter(value: StatusFilter) {
    setStatusFilter(value)
    setPage(0)
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {typeButtons.map((btn) => (
            <button
              key={btn.key}
              onClick={() => handleTypeFilter(btn.key)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                typeFilter === btn.key
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-card-foreground',
              )}
            >
              {btn.label}
            </button>
          ))}
        </div>
        <select
          value={statusFilter}
          onChange={(e) => handleStatusFilter(e.target.value as StatusFilter)}
          className="rounded-md border border-border bg-card px-3 py-1.5 text-xs text-card-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {statusOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="text-xs text-muted-foreground">{filtered.length} submissions</span>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Creator</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Handle</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Fee</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Video</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((s) => (
                <tr key={s.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                  <td className="px-4 py-3 text-card-foreground whitespace-nowrap">
                    {new Date(s.submissionDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 font-medium text-card-foreground">{s.creatorName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{s.creatorHandle}</td>
                  <td className="px-4 py-3 text-card-foreground">{s.productName}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
                        s.type === 'paid'
                          ? 'bg-violet-500/15 text-violet-400'
                          : 'bg-sky-500/15 text-sky-400',
                      )}
                    >
                      {s.type === 'paid' ? 'Paid' : 'Free'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-card-foreground">
                    {s.fee !== null ? `$${s.fee.toLocaleString()}` : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn('inline-block rounded-full px-2 py-0.5 text-xs font-medium', STATUS_CLASSES[s.status])}>
                      {STATUS_LABELS[s.status]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <a
                      href={s.videoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-muted-foreground">
                    No submissions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <span className="text-xs text-muted">Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded px-3 py-1 text-xs text-muted hover:text-card-foreground disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="rounded px-3 py-1 text-xs text-muted hover:text-card-foreground disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
