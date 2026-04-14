import { useMemo } from 'react'
import { KpiCard } from '@/modules/shared/components/kpi-card'
import { WorkflowChecklist } from '@/modules/workflow/components/workflow-checklist'
import { useWorkflowTasks } from '@/modules/workflow/hooks'

export function WorkflowPage() {
  const { data: tasks, isLoading } = useWorkflowTasks('client-1')

  const kpis = useMemo(() => {
    if (!tasks) return null

    const totalCompleted = tasks.reduce(
      (sum, t) => sum + t.completedThisWeek.filter(Boolean).length,
      0,
    )
    const totalGoal = tasks.reduce((sum, t) => sum + t.goal, 0)
    const overallPct = totalGoal > 0 ? totalCompleted / totalGoal : 0

    // "Today" = Wednesday (index 2) — count tasks expected today that are not done
    const todayIndex = 2 // Wed
    const tasksToday = tasks.filter((t) => {
      if (t.frequency === 'daily') return true
      return t.dayOfWeek.some((d) => d - 1 === todayIndex)
    }).length

    // Overdue: tasks whose day has passed (Mon=0, Tue=1) but not completed
    const overdueCount = tasks.reduce((sum, t) => {
      const pastDays = [0, 1] // Mon, Tue already passed this week
      let overdue = 0
      if (t.frequency === 'daily') {
        pastDays.forEach((d) => {
          if (!t.completedThisWeek[d]) overdue++
        })
      } else {
        t.dayOfWeek.forEach((dow) => {
          const idx = dow - 1
          if (idx <= 1 && !t.completedThisWeek[idx]) overdue++
        })
      }
      return sum + overdue
    }, 0)

    return { overallPct, tasksToday, overdueCount }
  }, [tasks])

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
        <h2 className="text-xl font-bold text-foreground">Workflow</h2>
        <p className="text-sm text-muted">
          Weekly task checklist for Affiliate Comms, Media Buyer, and SCS roles.
        </p>
      </div>

      {/* KPIs */}
      {kpis && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <KpiCard
            label="Overall Completion"
            value={kpis.overallPct}
            format="percent"
          />
          <KpiCard label="Tasks Today" value={kpis.tasksToday} format="number" />
          <KpiCard label="Overdue Tasks" value={kpis.overdueCount} format="number" />
        </div>
      )}

      {/* Checklist */}
      <WorkflowChecklist tasks={tasks ?? []} />
    </div>
  )
}
