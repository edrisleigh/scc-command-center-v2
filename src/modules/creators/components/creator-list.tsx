import { useState, useMemo } from 'react'
import { Search, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import { formatCurrency, formatPercent, cn } from '@/lib/utils'
import type { Creator } from '@/modules/creators/types'

interface CreatorListProps {
  creators: Creator[]
  onSelect: (creator: Creator) => void
  selectedId?: string | null
}

type SortKey = keyof Creator & string
type SortDir = 'asc' | 'desc'

const PAGE_SIZE = 15

export function CreatorList({ creators, onSelect, selectedId }: CreatorListProps) {
  const [filter, setFilter] = useState<'all' | 'vip' | 'pod'>('all')
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    let result = creators
    if (filter === 'vip') result = result.filter(c => c.isVip)
    if (filter === 'pod') result = result.filter(c => c.isBrandPod)
    if (search) result = result.filter(c => c.username.toLowerCase().includes(search.toLowerCase()))
    return result
  }, [creators, filter, search])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const aVal = a[sortKey]
      const bVal = b[sortKey]
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal
      }
      return sortDir === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal))
    })
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)
  const paged = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir(d => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('desc')
    }
  }

  function SortIcon({ columnKey }: { columnKey: string }) {
    if (sortKey !== columnKey) return <ArrowUpDown className="ml-1 inline h-3 w-3 text-muted-foreground" />
    return sortDir === 'asc'
      ? <ArrowUp className="ml-1 inline h-3 w-3 text-primary" />
      : <ArrowDown className="ml-1 inline h-3 w-3 text-primary" />
  }

  const columns: { key: SortKey; header: string; render: (c: Creator) => React.ReactNode }[] = [
    {
      key: 'username',
      header: 'Username',
      render: (c) => (
        <button
          onClick={() => onSelect(c)}
          className="text-left font-medium text-primary hover:underline"
        >
          {c.username}
        </button>
      ),
    },
    {
      key: 'isVip',
      header: 'VIP',
      render: (c) =>
        c.isVip ? (
          <span className="inline-block rounded-full bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-400">VIP</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: 'isBrandPod',
      header: 'Brand POD',
      render: (c) =>
        c.isBrandPod ? (
          <span className="inline-block rounded-full bg-violet-500/15 px-2 py-0.5 text-xs font-medium text-violet-400">POD</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
    },
    {
      key: 'p28dAffiliateGmv',
      header: 'P28D GMV',
      render: (c) => formatCurrency(c.p28dAffiliateGmv),
    },
    {
      key: 'deltaVsPriorPeriod',
      header: 'Vs Prior',
      render: (c) => (
        <span className={cn(c.deltaVsPriorPeriod >= 0 ? 'text-success' : 'text-danger')}>
          {c.deltaVsPriorPeriod >= 0 ? '+' : ''}{formatPercent(c.deltaVsPriorPeriod)}
        </span>
      ),
    },
    {
      key: 'affiliateProductsSold',
      header: 'Products Sold',
      render: (c) => c.affiliateProductsSold.toLocaleString(),
    },
    {
      key: 'blendedCommissionRate',
      header: 'Commission',
      render: (c) => formatPercent(c.blendedCommissionRate),
    },
    {
      key: 'ctr',
      header: 'CTR',
      render: (c) => formatPercent(c.ctr),
    },
    {
      key: 'gpm',
      header: 'GPM',
      render: (c) => formatCurrency(c.gpm),
    },
    {
      key: 'gmvPerSample',
      header: 'GMV/Sample',
      render: (c) => formatCurrency(c.gmvPerSample),
    },
  ]

  const filterButtons: { key: typeof filter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'vip', label: 'VIP Only' },
    { key: 'pod', label: 'Brand POD Only' },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1">
          {filterButtons.map((fb) => (
            <button
              key={fb.key}
              onClick={() => { setFilter(fb.key); setPage(0) }}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                filter === fb.key
                  ? 'bg-primary/15 text-primary'
                  : 'text-muted-foreground hover:text-card-foreground',
              )}
            >
              {fb.label}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search creators..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            className="rounded-md border border-border bg-card py-1.5 pl-8 pr-3 text-xs text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <span className="text-xs text-muted-foreground">{filtered.length} creators</span>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="cursor-pointer px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted hover:text-card-foreground"
                    onClick={() => handleSort(col.key)}
                  >
                    {col.header}
                    <SortIcon columnKey={col.key} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.map((creator) => (
                <tr
                  key={creator.id}
                  className={cn(
                    'border-b border-border last:border-0 cursor-pointer transition-colors',
                    selectedId === creator.id
                      ? 'bg-primary/10'
                      : 'hover:bg-accent/50',
                  )}
                  onClick={() => onSelect(creator)}
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3 text-card-foreground">
                      {col.render(creator)}
                    </td>
                  ))}
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                    No creators found
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
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} className="rounded px-3 py-1 text-xs text-muted hover:text-card-foreground disabled:opacity-40">Previous</button>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="rounded px-3 py-1 text-xs text-muted hover:text-card-foreground disabled:opacity-40">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
