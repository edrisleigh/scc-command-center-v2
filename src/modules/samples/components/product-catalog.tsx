import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { Product } from '@/modules/samples/types'

interface ProductCatalogProps {
  products: Product[]
}

const PAGE_SIZE = 15

export function ProductCatalog({ products }: ProductCatalogProps) {
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    if (!search) return products
    const q = search.toLowerCase()
    return products.filter(
      (p) =>
        p.productName.toLowerCase().includes(q) ||
        p.shortSku.toLowerCase().includes(q) ||
        p.sellerSku.toLowerCase().includes(q),
    )
  }, [products, search])

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            className="w-72 rounded-md border border-border bg-card py-1.5 pl-8 pr-3 text-xs text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <span className="text-xs text-muted-foreground">{filtered.length} products</span>
      </div>

      <div className="rounded-lg border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Product Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Short SKU</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Category</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted">Variation</th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted">Retail Price</th>
              </tr>
            </thead>
            <tbody>
              {paged.map((product) => (
                <tr
                  key={product.id}
                  className="border-b border-border last:border-0 transition-colors hover:bg-accent/50"
                >
                  <td className="px-4 py-3 font-medium text-card-foreground">{product.productName}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{product.shortSku}</td>
                  <td className="px-4 py-3 text-card-foreground">{product.category}</td>
                  <td className="px-4 py-3 text-muted-foreground">{product.variation}</td>
                  <td className="px-4 py-3 text-right font-medium text-card-foreground">
                    {formatCurrency(product.retailPrice)}
                  </td>
                </tr>
              ))}
              {paged.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                    No products found
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
