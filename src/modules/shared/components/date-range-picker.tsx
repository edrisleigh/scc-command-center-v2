import { format, subDays, startOfMonth, endOfMonth, subMonths } from 'date-fns'
import { CalendarDays } from 'lucide-react'
import { useDateRange } from '@/modules/shared/hooks/use-date-range'
import { cn } from '@/lib/utils'

const presets = [
  { label: 'Last 7 days', from: () => subDays(new Date(), 6), to: () => new Date() },
  { label: 'Last 28 days', from: () => subDays(new Date(), 27), to: () => new Date() },
  { label: 'This month', from: () => startOfMonth(new Date()), to: () => endOfMonth(new Date()) },
  { label: 'Last month', from: () => startOfMonth(subMonths(new Date(), 1)), to: () => endOfMonth(subMonths(new Date(), 1)) },
  { label: 'Last 3 months', from: () => startOfMonth(subMonths(new Date(), 2)), to: () => endOfMonth(new Date()) },
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
