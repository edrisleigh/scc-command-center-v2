import { useState, useMemo } from 'react'
import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  format,
  addMonths,
  subMonths,
  isSameDay,
  parseISO,
  isSameMonth,
} from 'date-fns'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CalendarEvent } from '@/modules/calendar/types'

interface CalendarViewProps {
  events: CalendarEvent[]
}

const EVENT_TYPE_CONFIG = {
  campaign: {
    label: 'Campaign',
    dot: 'bg-purple-500',
    badge: 'bg-purple-500/15 text-purple-400',
  },
  launch: {
    label: 'Launch',
    dot: 'bg-emerald-500',
    badge: 'bg-emerald-500/15 text-emerald-400',
  },
  tt_promo: {
    label: 'TT Promo',
    dot: 'bg-amber-500',
    badge: 'bg-amber-500/15 text-amber-400',
  },
  internal: {
    label: 'Internal',
    dot: 'bg-blue-500',
    badge: 'bg-blue-500/15 text-blue-400',
  },
} as const

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// Convert getDay (0=Sun) to Mon-first index (0=Mon)
function getMondayFirstIndex(date: Date): number {
  const day = getDay(date) // 0=Sun, 1=Mon, ..., 6=Sat
  return day === 0 ? 6 : day - 1
}

export function CalendarView({ events }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date(2025, 10, 1)) // Nov 2025
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  const days = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    return eachDayOfInterval({ start: monthStart, end: monthEnd })
  }, [currentMonth])

  const startPadding = getMondayFirstIndex(days[0])

  const eventsForMonth = useMemo(() => {
    return events.filter((e) => {
      const d = parseISO(e.date)
      return isSameMonth(d, currentMonth)
    })
  }, [events, currentMonth])

  const getEventsForDay = (day: Date) =>
    events.filter((e) => isSameDay(parseISO(e.date), day))

  const totalCells = Math.ceil((startPadding + days.length) / 7) * 7

  return (
    <div className="space-y-4">
      {/* Month navigation header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent hover:text-card-foreground transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <h3 className="text-base font-semibold text-card-foreground">
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-accent hover:text-card-foreground transition-colors"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {(Object.entries(EVENT_TYPE_CONFIG) as [keyof typeof EVENT_TYPE_CONFIG, (typeof EVENT_TYPE_CONFIG)[keyof typeof EVENT_TYPE_CONFIG]][]).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className={cn('h-2 w-2 rounded-full', cfg.dot)} />
            <span className="text-xs text-muted-foreground">{cfg.label}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-b border-border">
          {DAY_NAMES.map((day) => (
            <div
              key={day}
              className="py-2 text-center text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7">
          {Array.from({ length: totalCells }).map((_, idx) => {
            const dayOffset = idx - startPadding
            const day = dayOffset >= 0 && dayOffset < days.length ? days[dayOffset] : null
            const dayEvents = day ? getEventsForDay(day) : []
            const isToday = day ? isSameDay(day, new Date()) : false

            return (
              <div
                key={idx}
                className={cn(
                  'min-h-[80px] border-b border-r border-border p-1.5',
                  !day && 'bg-accent/20',
                  idx % 7 === 6 && 'border-r-0',
                  idx >= totalCells - 7 && 'border-b-0',
                )}
              >
                {day && (
                  <>
                    <div
                      className={cn(
                        'mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                        isToday
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground',
                      )}
                    >
                      {format(day, 'd')}
                    </div>
                    <div className="space-y-0.5">
                      {dayEvents.slice(0, 3).map((event) => (
                        <button
                          key={event.id}
                          onClick={() =>
                            setSelectedEvent(
                              selectedEvent?.id === event.id ? null : event,
                            )
                          }
                          className={cn(
                            'flex w-full items-center gap-1 rounded px-1 py-0.5 text-left text-[10px] font-medium leading-tight transition-colors',
                            selectedEvent?.id === event.id
                              ? 'bg-primary/20 text-primary'
                              : 'text-card-foreground hover:bg-accent',
                          )}
                        >
                          <div
                            className={cn(
                              'h-1.5 w-1.5 shrink-0 rounded-full',
                              EVENT_TYPE_CONFIG[event.type].dot,
                            )}
                          />
                          <span className="truncate">{event.title}</span>
                        </button>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="px-1 text-[10px] text-muted-foreground">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Event detail panel */}
      {selectedEvent && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-card-foreground">
                  {selectedEvent.title}
                </h4>
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    EVENT_TYPE_CONFIG[selectedEvent.type].badge,
                  )}
                >
                  {EVENT_TYPE_CONFIG[selectedEvent.type].label}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>
                  {format(parseISO(selectedEvent.date), 'EEEE, MMMM d, yyyy')}
                </span>
                <span>Owner: {selectedEvent.owner}</span>
              </div>
              {selectedEvent.notes && (
                <p className="pt-1 text-sm text-card-foreground">
                  {selectedEvent.notes}
                </p>
              )}
            </div>
            <button
              onClick={() => setSelectedEvent(null)}
              className="shrink-0 rounded p-1 text-muted-foreground hover:bg-accent hover:text-card-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Month summary */}
      {eventsForMonth.length === 0 && (
        <div className="rounded-lg border border-border bg-card px-6 py-8 text-center text-muted-foreground text-sm">
          No events scheduled for {format(currentMonth, 'MMMM yyyy')}.
        </div>
      )}
    </div>
  )
}
