import { useState } from 'react'
import { Plus, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { WorkflowTask, WorkflowTaskInput, WorkflowRole } from '@/modules/workflow/types'
import { TaskDialog } from '@/modules/workflow/components/task-dialog'
import {
  useCreateWorkflowTask,
  useUpdateWorkflowTask,
  useDeleteWorkflowTask,
} from '@/modules/workflow/hooks'

interface WorkflowChecklistProps {
  tasks: WorkflowTask[]
  clientId?: string
}

const ROLE_CONFIG: Record<WorkflowRole, { label: string; color: string; bg: string }> = {
  affiliate_comms: { label: 'Affiliate Comms', color: 'text-purple-400', bg: 'bg-purple-500/10' },
  media_buyer: { label: 'Media Buyer', color: 'text-blue-400', bg: 'bg-blue-500/10' },
  scs: { label: 'SCS', color: 'text-amber-400', bg: 'bg-amber-500/10' },
}

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

interface TaskRowProps {
  task: WorkflowTask
  onToggleDay: (task: WorkflowTask, dayIndex: number) => void
  onEdit: (task: WorkflowTask) => void
}

function TaskRow({ task, onToggleDay, onEdit }: TaskRowProps) {
  const completed = task.completedThisWeek.filter(Boolean).length
  const total = task.goal

  return (
    <div className="group flex items-center gap-3 rounded-md px-3 py-2 transition-colors hover:bg-accent/40">
      <div className="flex items-center gap-1">
        {task.completedThisWeek.map((done, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onToggleDay(task, i)}
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded text-[10px] font-bold transition',
              done
                ? 'bg-primary/20 text-primary hover:bg-primary/30'
                : 'border border-border text-muted-foreground hover:border-primary hover:text-primary',
            )}
            title={['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][i]}
            aria-label={`Toggle ${['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][i]} completion`}
          >
            {done ? '✓' : DAY_LABELS[i]}
          </button>
        ))}
      </div>

      <span className="flex-1 truncate text-sm text-card-foreground">{task.taskName}</span>

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

      <span
        className={cn(
          'shrink-0 text-xs font-semibold tabular-nums',
          getCompletionColor(completed / total),
        )}
      >
        {completed}/{total}
      </span>

      <button
        onClick={() => onEdit(task)}
        className="shrink-0 rounded p-1 text-muted-foreground opacity-0 transition hover:bg-accent hover:text-card-foreground group-hover:opacity-100"
        aria-label="Edit task"
      >
        <Pencil className="h-3 w-3" />
      </button>
    </div>
  )
}

interface RoleSectionProps {
  role: WorkflowRole
  tasks: WorkflowTask[]
  onToggleDay: (task: WorkflowTask, dayIndex: number) => void
  onEdit: (task: WorkflowTask) => void
  onAdd: (role: WorkflowRole) => void
}

function RoleSection({ role, tasks, onToggleDay, onEdit, onAdd }: RoleSectionProps) {
  const cfg = ROLE_CONFIG[role]

  const totalCompleted = tasks.reduce(
    (sum, t) => sum + t.completedThisWeek.filter(Boolean).length,
    0,
  )
  const totalGoal = tasks.reduce((sum, t) => sum + t.goal, 0)
  const pct = totalGoal > 0 ? totalCompleted / totalGoal : 0
  const pctDisplay = Math.round(pct * 100)

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className={cn('flex items-center justify-between px-4 py-3', cfg.bg)}>
        <div className="flex items-center gap-2">
          <h3 className={cn('text-sm font-semibold', cfg.color)}>{cfg.label}</h3>
          <span className="text-xs text-muted-foreground">
            {totalCompleted}/{totalGoal} tasks completed this week
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-border">
            <div
              className={cn('h-1.5 rounded-full transition-all', getCompletionBg(pct))}
              style={{ width: `${pct * 100}%` }}
            />
          </div>
          <span className={cn('text-xs font-bold tabular-nums', getCompletionColor(pct))}>
            {pctDisplay}%
          </span>
          <button
            onClick={() => onAdd(role)}
            className="flex items-center gap-1 rounded-md border border-border bg-card/80 px-2 py-1 text-[11px] text-muted-foreground transition hover:bg-accent hover:text-card-foreground"
          >
            <Plus className="h-3 w-3" />
            Add task
          </button>
        </div>
      </div>

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
        <span className="flex-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Task
        </span>
        <span className="w-14 shrink-0 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Freq
        </span>
        <span className="w-8 shrink-0 text-right text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Done
        </span>
        <span className="w-5 shrink-0" />
      </div>

      <div className="divide-y divide-border/50">
        {tasks.length === 0 ? (
          <p className="px-4 py-6 text-center text-xs text-muted">
            No tasks yet. Click "Add task" to create one.
          </p>
        ) : (
          tasks.map((task) => (
            <TaskRow key={task.id} task={task} onToggleDay={onToggleDay} onEdit={onEdit} />
          ))
        )}
      </div>
    </div>
  )
}

export function WorkflowChecklist({ tasks, clientId = 'client-1' }: WorkflowChecklistProps) {
  const roles: WorkflowRole[] = ['affiliate_comms', 'media_buyer', 'scs']
  const createMutation = useCreateWorkflowTask(clientId)
  const updateMutation = useUpdateWorkflowTask(clientId)
  const deleteMutation = useDeleteWorkflowTask(clientId)

  const [dialog, setDialog] = useState<
    { mode: 'create'; role: WorkflowRole } | { mode: 'edit'; task: WorkflowTask } | null
  >(null)

  const totalCompleted = tasks.reduce(
    (sum, t) => sum + t.completedThisWeek.filter(Boolean).length,
    0,
  )
  const totalGoal = tasks.reduce((sum, t) => sum + t.goal, 0)
  const overallPct = totalGoal > 0 ? totalCompleted / totalGoal : 0
  const overallPctDisplay = Math.round(overallPct * 100)

  const handleToggleDay = (task: WorkflowTask, dayIndex: number) => {
    const next = [...task.completedThisWeek]
    next[dayIndex] = !next[dayIndex]
    updateMutation.mutate({ id: task.id, patch: { completedThisWeek: next } })
  }

  const handleSubmit = async (input: WorkflowTaskInput) => {
    if (dialog?.mode === 'edit') {
      await updateMutation.mutateAsync({ id: dialog.task.id, patch: input })
    } else {
      await createMutation.mutateAsync(input)
    }
  }

  const handleDelete = async () => {
    if (dialog?.mode !== 'edit') return
    await deleteMutation.mutateAsync(dialog.task.id)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Overall Weekly Completion
          </div>
          <div className="mt-0.5 text-sm text-muted-foreground">
            {totalCompleted} of {totalGoal} task completions this week
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="h-2 w-32 overflow-hidden rounded-full bg-border">
            <div
              className={cn('h-2 rounded-full transition-all', getCompletionBg(overallPct))}
              style={{ width: `${overallPct * 100}%` }}
            />
          </div>
          <span
            className={cn('text-2xl font-bold tabular-nums', getCompletionColor(overallPct))}
          >
            {overallPctDisplay}%
          </span>
        </div>
      </div>

      {roles.map((role) => {
        const roleTasks = tasks.filter((t) => t.role === role)
        return (
          <RoleSection
            key={role}
            role={role}
            tasks={roleTasks}
            onToggleDay={handleToggleDay}
            onEdit={(task) => setDialog({ mode: 'edit', task })}
            onAdd={(r) => setDialog({ mode: 'create', role: r })}
          />
        )
      })}

      <TaskDialog
        open={dialog !== null}
        onClose={() => setDialog(null)}
        task={dialog?.mode === 'edit' ? dialog.task : null}
        initialRole={dialog?.mode === 'create' ? dialog.role : undefined}
        onSubmit={handleSubmit}
        onDelete={dialog?.mode === 'edit' ? handleDelete : undefined}
      />
    </div>
  )
}
