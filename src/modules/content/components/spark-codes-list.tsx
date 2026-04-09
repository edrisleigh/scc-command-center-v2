import { useMemo } from 'react'
import { CheckCircle, XCircle, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SparkCode } from '@/modules/content/types'

interface SparkCodesListProps {
  sparkCodes: SparkCode[]
}

type ExpirationStatus = 'active' | 'expiring_soon' | 'expired'

function getExpirationStatus(expirationDate: string): ExpirationStatus {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const exp = new Date(expirationDate)
  exp.setHours(0, 0, 0, 0)
  const sevenDaysFromNow = new Date(today)
  sevenDaysFromNow.setDate(today.getDate() + 7)

  if (exp < today) return 'expired'
  if (exp < sevenDaysFromNow) return 'expiring_soon'
  return 'active'
}

const STATUS_LABELS: Record<ExpirationStatus, string> = {
  active: 'Active',
  expiring_soon: 'Expiring Soon',
  expired: 'Expired',
}

const STATUS_CLASSES: Record<ExpirationStatus, string> = {
  active: 'bg-green-500/15 text-green-400',
  expiring_soon: 'bg-amber-500/15 text-amber-400',
  expired: 'bg-red-500/15 text-red-400',
}

export function SparkCodesList({ sparkCodes }: SparkCodesListProps) {
  const sorted = useMemo(() => {
    return [...sparkCodes].sort((a, b) => {
      return new Date(a.expirationDate).getTime() - new Date(b.expirationDate).getTime()
    })
  }, [sparkCodes])

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-xs text-muted-foreground">{sparkCodes.length} spark codes</span>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-green-400" />
            Active
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-amber-400" />
            Expiring Soon
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-red-400" />
            Expired
          </span>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Creator</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Handle</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Expiration Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Permission</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Video</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((sc) => {
                const expStatus = getExpirationStatus(sc.expirationDate)
                return (
                  <tr key={sc.id} className="border-b border-border last:border-0 hover:bg-accent/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-card-foreground">{sc.creatorName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{sc.creatorHandle}</td>
                    <td className="px-4 py-3 text-card-foreground">{sc.productName}</td>
                    <td className={cn(
                      'px-4 py-3 whitespace-nowrap',
                      expStatus === 'expired' ? 'text-red-400' :
                      expStatus === 'expiring_soon' ? 'text-amber-400' :
                      'text-card-foreground',
                    )}>
                      {new Date(sc.expirationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-4 py-3">
                      {sc.hasPermission
                        ? <CheckCircle className="h-4 w-4 text-green-400" />
                        : <XCircle className="h-4 w-4 text-red-400" />
                      }
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn('inline-block rounded-full px-2 py-0.5 text-xs font-medium', STATUS_CLASSES[expStatus])}>
                        {STATUS_LABELS[expStatus]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <a
                        href={sc.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </td>
                  </tr>
                )
              })}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                    No spark codes found
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
