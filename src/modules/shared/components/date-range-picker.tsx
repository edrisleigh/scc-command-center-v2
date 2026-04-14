import { format } from 'date-fns'
import { CalendarDays } from 'lucide-react'
import { useDateRange } from '@/modules/shared/hooks/use-date-range'
import { cn } from '@/lib/utils'

// Presets aligned with fixture data range (Sep–Nov 2025)
const presets = [
  { label: 'Apr 2026', from: () => new Date('2026-04-01'), to: () => new Date('2026-04-13') },
  { label: 'Mar 2026', from: () => new Date('2026-03-01'), to: () => new Date('2026-03-31') },
  { label: 'Q1 2026',  from: () => new Date('2026-01-01'), to: () => new Date('2026-03-31') },
  { label: 'Q4 2025',  from: () => new Date('2025-10-01'), to: () => new Date('2025-12-31') },
  { label: 'All Data', from: () => new Date('2025-01-01'), to: () => new Date('2026-04-13') },
]

export function DateRangePicker() {
  const [dateRange, setDateRange] = useDateRange()

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-2 rounded-md bg-accent px-3 py-1.5 text-sm text-accent-foreground">
        <CalendarDays className="h-4 w-4 text-muted" />
        <span>{format(dateRange.from, 'MMM d, yyyy')} – {format(dateRange.to, 'MMM d, yyyy')}</span>
      </div>
      <div className="flex gap-1">
        {presets.map((preset) => (
          <button key={preset.label} onClick={() => setDateRange({ from: preset.from(), to: preset.to() })} className={cn('rounded px-2 py-1 text-xs text-muted-foreground hover:text-card-foreground')}>
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  )
}
