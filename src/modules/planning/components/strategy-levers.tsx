import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { StrategyLever, StrategyTask } from '@/modules/planning/types'

interface StrategyLeversProps {
  levers: StrategyLever[]
}

const statusConfig: Record<StrategyTask['status'], { label: string; className: string }> = {
  not_started: { label: 'Not Started', className: 'bg-zinc-500/15 text-zinc-400' },
  in_progress: { label: 'In Progress', className: 'bg-blue-500/15 text-blue-400' },
  completed: { label: 'Completed', className: 'bg-emerald-500/15 text-emerald-400' },
  blocked: { label: 'Blocked', className: 'bg-red-500/15 text-red-400' },
}

interface LeverSectionProps {
  lever: StrategyLever
  defaultOpen?: boolean
}

function LeverSection({ lever, defaultOpen = true }: LeverSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)

  const completedCount = lever.tasks.filter((t) => t.status === 'completed').length
  const totalCount = lever.tasks.length

  return (
    <div className="rounded-lg border border-border bg-card">
      {/* Lever Header */}
      <button
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-accent/40 transition-colors rounded-lg"
      >
        <div className="flex items-center gap-3">
          {isOpen ? (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
          <span className="font-semibold text-card-foreground">{lever.name}</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span
            className={cn(
              'rounded-full px-2 py-0.5 font-medium',
              completedCount === totalCount
                ? 'bg-emerald-500/15 text-emerald-400'
                : 'bg-zinc-500/15 text-zinc-400',
            )}
          >
            {completedCount} / {totalCount} completed
          </span>
        </div>
      </button>

      {/* Task Table */}
      {isOpen && (
        <div className="border-t border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-accent/20">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Task</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Owner</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Due Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Notes</th>
                </tr>
              </thead>
              <tbody>
                {lever.tasks.map((task) => {
                  const status = statusConfig[task.status]
                  return (
                    <tr
                      key={task.id}
                      className="border-b border-border last:border-0 hover:bg-accent/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-card-foreground max-w-xs">
                        {task.task}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {task.owner}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-block rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap',
                            status.className,
                          )}
                        >
                          {status.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs max-w-sm">
                        {task.notes || '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export function StrategyLevers({ levers }: StrategyLeversProps) {
  return (
    <div className="space-y-4">
      {levers.map((lever, index) => (
        <LeverSection key={lever.id} lever={lever} defaultOpen={index === 0} />
      ))}

      {levers.length === 0 && (
        <div className="rounded-lg border border-border bg-card px-6 py-12 text-center text-muted-foreground">
          No strategy levers found.
        </div>
      )}
    </div>
  )
}
