import { formatDistanceToNow, parseISO, format } from 'date-fns'
import { toast } from 'sonner'
import { CircleCheck, CircleSlash, RefreshCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useFreshness, useRecordRefresh } from '@/modules/freshness/hooks'
import { useCurrentUser } from '@/modules/shared/hooks/use-current-user'
import type { DataSource } from '@/modules/freshness/types'

interface FreshnessBadgeProps {
  source: DataSource
  clientId?: string
  allowRefresh?: boolean
  size?: 'sm' | 'md'
}

export function FreshnessBadge({
  source,
  clientId = 'client-1',
  allowRefresh = true,
  size = 'md',
}: FreshnessBadgeProps) {
  const { data } = useFreshness(clientId)
  const record = data?.find((r) => r.dataSource === source) ?? null
  const user = useCurrentUser()
  const canRefresh = allowRefresh && user.role === 'admin'
  const refresh = useRecordRefresh(clientId)

  const baseClass = cn(
    'inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5',
    size === 'sm' ? 'text-[10px]' : 'text-[11px]',
  )

  const handleRefresh = async () => {
    try {
      await refresh.mutateAsync(source)
      toast.success('Marked as refreshed')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to mark as refreshed')
    }
  }

  if (!record) {
    return (
      <span className={cn(baseClass, 'border-border text-muted')}>
        <CircleSlash className="h-3 w-3" />
        Never updated
        {canRefresh && (
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refresh.isPending}
            className="ml-1 text-primary hover:underline disabled:opacity-50"
          >
            Mark fresh
          </button>
        )}
      </span>
    )
  }

  const updated = parseISO(record.updatedAt)
  const relative = formatDistanceToNow(updated, { addSuffix: true })
  const absolute = format(updated, 'MMM d, yyyy h:mm a')

  return (
    <span
      className={cn(baseClass, 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400')}
      title={`${absolute} · by ${record.updatedBy}`}
    >
      <CircleCheck className="h-3 w-3" />
      Updated {relative}
      <span className="text-muted"> · by {record.updatedBy}</span>
      {canRefresh && (
        <button
          type="button"
          onClick={handleRefresh}
          disabled={refresh.isPending}
          className="ml-1 rounded p-0.5 text-muted hover:bg-accent hover:text-card-foreground disabled:opacity-50"
          aria-label="Mark as refreshed"
          title="Mark as refreshed"
        >
          <RefreshCcw className="h-3 w-3" />
        </button>
      )}
    </span>
  )
}
