import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'
import type { SampleOrder } from '@/modules/samples/types'

interface SampleOrdersProps {
  orders: SampleOrder[]
}

type StatusFilter = 'all' | SampleOrder['status']

const STATUS_BADGE: Record<SampleOrder['status'], string> = {
  pending: 'bg-amber-500/15 text-amber-400',
  shipped: 'bg-blue-500/15 text-blue-400',
  delivered: 'bg-green-500/15 text-green-400',
  completed: 'bg-emerald-500/15 text-emerald-400',
  cancelled: 'bg-red-500/15 text-red-400',
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function truncateOrderId(orderId: string): string {
  if (orderId.length <= 16) return orderId
  return `…${orderId.slice(-12)}`
}

const PAGE_SIZE = 15

export function SampleOrders({ orders }: SampleOrdersProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    if (statusFilter === 'all') return orders
    return orders.filter((o) => o.status === statusFilter)
  }, [orders, statusFilter])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const statusFilters: { key: StatusFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'delivered', label: 'Delivered' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {statusFilters.map((sf) => (
          <button
            key={sf.key}
            onClick={() => { setStatusFilter(sf.key); setPage(0) }}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
              statusFilter === sf.key
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:text-card-foreground',
            )}
          >
            {sf.label}
          </button>
        ))}
        <span className="ml-1 text-xs text-muted-foreground">{filtered.length} orders</span>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Order ID</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Creator</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Variation</th>
                <th className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-muted">Qty</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Created</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Shipped</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Delivered</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Tracking</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-border last:border-0 transition-colors hover:bg-accent/50"
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground" title={order.orderId}>
                    {truncateOrderId(order.orderId)}
                  </td>
                  <td className="px-4 py-3 font-medium text-primary">{order.creatorUsername}</td>
                  <td className="px-4 py-3 text-card-foreground">{order.productName}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{order.variation}</td>
                  <td className="px-4 py-3 text-center text-card-foreground">{order.quantity}</td>
                  <td className="px-4 py-3">
                    <span
                      className={cn(
                        'inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                        STATUS_BADGE[order.status],
                      )}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(order.createdTime)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(order.shippedTime)}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(order.deliveredTime)}</td>
                  <td className="px-4 py-3">
                    {order.trackingId ? (
                      <span className="font-mono text-xs text-muted-foreground" title={order.trackingId}>
                        {order.trackingId.length > 14 ? `…${order.trackingId.slice(-10)}` : order.trackingId}
                        {order.shippingProvider && (
                          <span className="ml-1 text-muted-foreground/60">({order.shippingProvider})</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-muted-foreground">
                    No orders found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <span className="text-xs text-muted">Page {page + 1} of {totalPages}</span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="rounded px-3 py-1 text-xs text-muted hover:text-card-foreground disabled:opacity-40"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="rounded px-3 py-1 text-xs text-muted hover:text-card-foreground disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
