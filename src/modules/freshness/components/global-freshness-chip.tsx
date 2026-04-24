import { useState, useRef, useEffect } from 'react'
import { formatDistanceToNow, parseISO, format } from 'date-fns'
import { Activity } from 'lucide-react'
import { useFreshness } from '@/modules/freshness/hooks'
import { DATA_SOURCE_LABELS, type DataSource } from '@/modules/freshness/types'
import { cn } from '@/lib/utils'

interface GlobalFreshnessChipProps {
  clientId?: string
}

const SOURCE_ORDER: DataSource[] = [
  'shop-daily',
  'video-daily',
  'ads-daily',
  'creators',
  'content',
  'samples',
  'scorecards',
  'calendar',
  'workflow',
]

export function GlobalFreshnessChip({ clientId = 'client-1' }: GlobalFreshnessChipProps) {
  const { data } = useFreshness(clientId)
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const records = data ?? []
  const mostRecent = records.reduce<(typeof records)[number] | null>((acc, r) => {
    if (!acc) return r
    return r.updatedAt > acc.updatedAt ? r : acc
  }, null)

  const label = mostRecent
    ? `Last refresh: ${formatDistanceToNow(parseISO(mostRecent.updatedAt), { addSuffix: true })}`
    : 'No data refreshed yet'

  const recordBySource = new Map(records.map((r) => [r.dataSource, r]))

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs transition',
          mostRecent ? 'text-card-foreground' : 'text-muted',
          'hover:bg-accent',
        )}
        aria-expanded={open}
      >
        <Activity className="h-3.5 w-3.5 text-primary" />
        {label}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-40 mt-2 w-80 rounded-lg border border-border bg-card shadow-lg">
          <div className="border-b border-border px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
            Data freshness
          </div>
          <div className="max-h-80 divide-y divide-border/50 overflow-y-auto">
            {SOURCE_ORDER.map((source) => {
              const record = recordBySource.get(source)
              return (
                <div
                  key={source}
                  className="flex items-center justify-between px-3 py-2 text-xs"
                >
                  <span className="text-card-foreground">{DATA_SOURCE_LABELS[source]}</span>
                  {record ? (
                    <span
                      className="text-right text-muted"
                      title={`${format(parseISO(record.updatedAt), 'MMM d, yyyy h:mm a')} · ${record.updatedBy}`}
                    >
                      {formatDistanceToNow(parseISO(record.updatedAt), { addSuffix: true })}
                      <br />
                      <span className="text-[10px]">by {record.updatedBy}</span>
                    </span>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
