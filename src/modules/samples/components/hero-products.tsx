import { useMemo } from 'react'
import { Star } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import type { HeroProduct } from '@/modules/samples/types'

interface HeroProductsProps {
  products: HeroProduct[]
}

function formatViews(views: number): string {
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`
  if (views >= 1_000) return `${(views / 1_000).toFixed(0)}K`
  return views.toLocaleString()
}

export function HeroProducts({ products }: HeroProductsProps) {
  const sorted = useMemo(
    () => [...products].sort((a, b) => b.p28dGmv - a.p28dGmv),
    [products],
  )

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Sorted by P28D GMV descending. Hero products are prioritized for sample seeding and creator collaboration.
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((product) => (
          <div
            key={product.id}
            className="relative rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/40"
          >
            {product.isHero && (
              <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="text-xs font-medium text-amber-400">Hero</span>
              </div>
            )}

            <div className="mb-3 pr-16">
              <div className="font-medium text-card-foreground leading-tight">{product.productName}</div>
              <div className="mt-0.5 font-mono text-xs text-muted-foreground">{product.shortSku}</div>
              <div className="mt-0.5 text-xs text-muted-foreground">{product.category}</div>
            </div>

            <div className="grid grid-cols-3 gap-3 border-t border-border pt-3">
              <div>
                <div className="text-[10px] uppercase tracking-wide text-muted">P28D GMV</div>
                <div className="mt-0.5 text-base font-bold text-card-foreground">
                  {formatCurrency(product.p28dGmv)}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wide text-muted">Orders</div>
                <div className="mt-0.5 text-base font-bold text-card-foreground">
                  {product.p28dOrders.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-wide text-muted">Views</div>
                <div className="mt-0.5 text-base font-bold text-card-foreground">
                  {formatViews(product.p28dViews)}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
