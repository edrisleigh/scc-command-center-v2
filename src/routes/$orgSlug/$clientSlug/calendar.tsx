import { useMemo } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { isSameMonth, parseISO } from 'date-fns'
import { KpiCard } from '@/modules/shared/components/kpi-card'
import { CalendarView } from '@/modules/calendar/components/calendar-view'
import { useCalendarEvents } from '@/modules/calendar/hooks'

function CalendarPage() {
  const { data: events, isLoading } = useCalendarEvents('client-1')

  const kpis = useMemo(() => {
    if (!events) return null
    const now = new Date()
    const thisMonth = events.filter((e) => isSameMonth(parseISO(e.date), now))
    return {
      total: thisMonth.length,
      campaigns: thisMonth.filter((e) => e.type === 'campaign').length,
      launches: thisMonth.filter((e) => e.type === 'launch').length,
      promos: thisMonth.filter((e) => e.type === 'tt_promo').length,
    }
  }, [events])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted">
        Loading...
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Calendar</h2>
        <p className="text-sm text-muted">
          Campaign launches, TikTok promos, and team events at a glance.
        </p>
      </div>

      {/* KPIs */}
      {kpis && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <KpiCard label="Total Events This Month" value={kpis.total} format="number" />
          <KpiCard label="Campaigns" value={kpis.campaigns} format="number" />
          <KpiCard label="Launches" value={kpis.launches} format="number" />
          <KpiCard label="Promos" value={kpis.promos} format="number" />
        </div>
      )}

      {/* Calendar */}
      <CalendarView events={events ?? []} />
    </div>
  )
}

export const Route = createFileRoute('/$orgSlug/$clientSlug/calendar')({
  component: CalendarPage,
})
