import { cn } from '@/lib/utils'
import type { Restock } from '@/modules/samples/types'

interface RestocksProps {
  restocks: Restock[]
}

function formatEta(eta: string | null): string {
  if (!eta) return '—'
  return new Date(eta).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function Restocks({ restocks }: RestocksProps) {
  const sorted = [...restocks].sort((a, b) => {
    if (a.hasRestock === b.hasRestock) return 0
    return a.hasRestock ? -1 : 1
  })

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">SKU</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted">Needs Restock</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">ETA</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Notes</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((restock) => (
                <tr
                  key={restock.id}
                  className={cn(
                    'border-b border-border last:border-0 transition-colors',
                    restock.hasRestock
                      ? 'bg-amber-500/5 hover:bg-amber-500/10'
                      : 'hover:bg-accent/50',
                  )}
                >
                  <td className={cn('px-4 py-3 font-medium', restock.hasRestock ? 'text-card-foreground' : 'text-muted-foreground')}>
                    {restock.productName}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{restock.shortSku}</td>
                  <td className="px-4 py-3 text-center">
                    {restock.hasRestock ? (
                      <span className="inline-block rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-400">
                        Yes
                      </span>
                    ) : (
                      <span className="inline-block rounded-full bg-muted/20 px-2 py-0.5 text-xs font-medium text-muted-foreground">
                        No
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-card-foreground">{formatEta(restock.eta)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{restock.notes}</td>
                </tr>
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No restock data found
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
