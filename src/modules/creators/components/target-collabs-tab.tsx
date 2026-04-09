import { cn } from '@/lib/utils'
import type { TargetCollab } from '@/modules/creators/types'

interface TargetCollabsTabProps {
  collabs: TargetCollab[]
}

const statusConfig: Record<TargetCollab['status'], { label: string; className: string }> = {
  pending: { label: 'Pending', className: 'bg-amber-500/15 text-amber-400' },
  in_progress: { label: 'In Progress', className: 'bg-blue-500/15 text-blue-400' },
  completed: { label: 'Completed', className: 'bg-emerald-500/15 text-emerald-400' },
  declined: { label: 'Declined', className: 'bg-red-500/15 text-red-400' },
}

export function TargetCollabsTab({ collabs }: TargetCollabsTabProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Target collaborations with creators and their current status.
      </p>
      <div className="rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Creator</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Notes</th>
              </tr>
            </thead>
            <tbody>
              {collabs.map((collab) => {
                const status = statusConfig[collab.status]
                return (
                  <tr key={collab.id} className="border-b border-border last:border-0 hover:bg-accent/50">
                    <td className="px-4 py-3 font-medium text-card-foreground">{collab.creatorUsername}</td>
                    <td className="px-4 py-3 text-card-foreground">{collab.product}</td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-block rounded-full px-2.5 py-0.5 text-xs font-medium', status.className)}>
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{collab.notes}</td>
                  </tr>
                )
              })}
              {collabs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                    No target collaborations found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
