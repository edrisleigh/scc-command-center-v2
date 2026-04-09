import { cn } from '@/lib/utils'
import type { WorkflowTask } from '@/modules/workflow/types'

interface WorkflowChecklistProps {
  tasks: WorkflowTask[]
}

const ROLE_CONFIG = {
  affiliate_comms: { label: 'Affiliate Comms', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  media_buyer: { label: 'Media Buyer', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  scs: { label: 'SCS', color: 'text-amber-400', bg: 'bg-amber-500/10' },
} as const

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F']

function getCompletionColor(pct: number): string {
  if (pct > 0.8) return 'text-emerald-400'
  if (pct >= 0.5) return 'text-amber-400'
  return 'text-red-400'
}

function getCompletionBg(pct: number): string {
  if (pct > 0.8) return 'bg-emerald-500'
  if (pct >= 0.5) return 'bg-amber-500'
  return 'bg-red-500'
}

function TaskRow({ task }: { task: WorkflowTask }) {
  const completed = task.completedThisWeek.filter(Boolean).length
  const total = task.goal

  return (
    <div className="flex items-center gap-3 rounded-md px-3 py-2 hover:bg-accent/40 transition-colors">
      {/* Day checkboxes */}
      <div className="flex items-center gap-1">
        {task.completedThisWeek.map((done, i) => (
          <div
            key={i}
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold',
              done
                ? 'bg-primary/20 text-primary'
                : 'border border-border text-muted-foreground',
            )}
            title={['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][i]}
          >
            {done ? '✓' : DAY_LABELS[i]}
          </div>
        ))}
      </div>

      {/* Task name */}
      <span className="flex-1 truncate text-sm text-card-foreground">
        {task.taskName}
      </span>

      {/* Frequency badge */}
      <span
        className={cn(
          'shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide',
          task.frequency === 'daily'
            ? 'bg-blue-500/15 text-blue-400'
            : 'bg-purple-500/15 text-purple-400',
        )}
      >
        {task.frequency}
      </span>

      {/* Completion count */}
      <span className={cn('shrink-0 text-xs font-semibold tabular-nums', getCompletionColor(completed / total))}>
        {completed}/{total}
      </span>
    </div>
  )
}

interface RoleSectionProps {
  role: WorkflowTask['role']
  tasks: WorkflowTask[]
}

function RoleSection({ role, tasks }: RoleSectionProps) {
  const cfg = ROLE_CONFIG[role]

  const totalCompleted = tasks.reduce(
    (sum, t) => sum + t.completedThisWeek.filter(Boolean).length,
    0,
  )
  const totalGoal = tasks.reduce((sum, t) => sum + t.goal, 0)
  const pct = totalGoal > 0 ? totalCompleted / totalGoal : 0
  const pctDisplay = Math.round(pct * 100)

  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      {/* Role header */}
      <div className={cn('flex items-center justify-between px-4 py-3', cfg.bg)}>
        <div className="flex items-center gap-2">
          <h3 className={cn('font-semibold text-sm', cfg.color)}>{cfg.label}</h3>
          <span className="text-xs text-muted-foreground">
            {totalCompleted}/{totalGoal} tasks completed this week
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 rounded-full bg-border overflow-hidden">
            <div
              className={cn('h-1.5 rounded-full transition-all', getCompletionBg(pct))}
              style={{ width: `${pct * 100}%` }}
            />
          </div>
          <span
            className={cn(
              'text-xs font-bold tabular-nums',
              getCompletionColor(pct),
            )}
          >
            {pctDisplay}%
          </span>
        </div>
      </div>

      {/* Day header row */}
      <div className="flex items-center gap-3 border-b border-border px-3 py-1.5">
        <div className="flex items-center gap-1">
          {DAY_LABELS.map((d, i) => (
            <div
              key={i}
              className="flex h-6 w-6 items-center justify-center text-[10px] font-semibold uppercase text-muted-foreground"
            >
              {d}
            </div>
          ))}
        </div>
        <span className="flex-1 text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">
          Task
        </span>
        <span className="shrink-0 w-14 text-right text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">
          Freq
        </span>
        <span className="shrink-0 w-8 text-right text-[11px] uppercase tracking-wide font-semibold text-muted-foreground">
          Done
        </span>
      </div>

      {/* Task rows */}
      <div className="divide-y divide-border/50 px-0">
        {tasks.map((task) => (
          <TaskRow key={task.id} task={task} />
        ))}
      </div>
    </div>
  )
}

export function WorkflowChecklist({ tasks }: WorkflowChecklistProps) {
  const roles: WorkflowTask['role'][] = ['affiliate_comms', 'media_buyer', 'scs']

  const totalCompleted = tasks.reduce(
    (sum, t) => sum + t.completedThisWeek.filter(Boolean).length,
    0,
  )
  const totalGoal = tasks.reduce((sum, t) => sum + t.goal, 0)
  const overallPct = totalGoal > 0 ? totalCompleted / totalGoal : 0
  const overallPctDisplay = Math.round(overallPct * 100)

  return (
    <div className="space-y-4">
      {/* Overall score banner */}
      <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">
            Overall Weekly Completion
          </div>
          <div className="mt-0.5 text-sm text-muted-foreground">
            {totalCompleted} of {totalGoal} task completions this week
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-2 w-32 rounded-full bg-border overflow-hidden">
            <div
              className={cn('h-2 rounded-full transition-all', getCompletionBg(overallPct))}
              style={{ width: `${overallPct * 100}%` }}
            />
          </div>
          <span
            className={cn(
              'text-2xl font-bold tabular-nums',
              getCompletionColor(overallPct),
            )}
          >
            {overallPctDisplay}%
          </span>
        </div>
      </div>

      {/* Role sections */}
      {roles.map((role) => {
        const roleTasks = tasks.filter((t) => t.role === role)
        if (roleTasks.length === 0) return null
        return <RoleSection key={role} role={role} tasks={roleTasks} />
      })}
    </div>
  )
}
