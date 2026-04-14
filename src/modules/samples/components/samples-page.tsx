import { useState, useMemo } from 'react'
import { KpiCard } from '@/modules/shared/components/kpi-card'
import { ProductCatalog } from '@/modules/samples/components/product-catalog'
import { SampleOrders } from '@/modules/samples/components/sample-orders'
import { HeroProducts } from '@/modules/samples/components/hero-products'
import { Restocks } from '@/modules/samples/components/restocks'
import { useProducts, useSampleOrders, useHeroProducts, useRestocks } from '@/modules/samples/hooks'
import { cn } from '@/lib/utils'

type Tab = 'products' | 'orders' | 'hero' | 'restocks'

export function SamplesPage() {
  const [activeTab, setActiveTab] = useState<Tab>('products')

  const { data: products, isLoading: loadingProducts } = useProducts('client-1')
  const { data: sampleOrders, isLoading: loadingOrders } = useSampleOrders('client-1')
  const { data: heroProducts, isLoading: loadingHero } = useHeroProducts('client-1')
  const { data: restocks, isLoading: loadingRestocks } = useRestocks('client-1')

  const isLoading = loadingProducts || loadingOrders || loadingHero || loadingRestocks

  const kpis = useMemo(() => {
    return {
      totalProducts: products?.length ?? 0,
      activeSamples: sampleOrders?.filter((o) => o.status === 'pending' || o.status === 'shipped' || o.status === 'delivered').length ?? 0,
      heroCount: heroProducts?.filter((p) => p.isHero).length ?? 0,
      pendingRestocks: restocks?.filter((r) => r.hasRestock).length ?? 0,
    }
  }, [products, sampleOrders, heroProducts, restocks])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-muted">
        Loading...
      </div>
    )
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'products', label: 'Products' },
    { key: 'orders', label: 'Sample Orders' },
    { key: 'hero', label: 'Hero Products' },
    { key: 'restocks', label: 'Restocks' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Samples &amp; Products</h2>
        <p className="text-sm text-muted">Manage product catalog, track sample orders, and monitor hero SKUs.</p>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <KpiCard label="Total Products" value={kpis.totalProducts} format="number" />
        <KpiCard label="Active Samples" value={kpis.activeSamples} format="number" />
        <KpiCard label="Hero Products" value={kpis.heroCount} format="number" />
        <KpiCard label="Pending Restocks" value={kpis.pendingRestocks} format="number" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              'rounded-t-md px-4 py-2 text-sm font-medium transition-colors',
              activeTab === tab.key
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:text-card-foreground',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'products' && (
        <ProductCatalog products={products ?? []} />
      )}
      {activeTab === 'orders' && (
        <SampleOrders orders={sampleOrders ?? []} />
      )}
      {activeTab === 'hero' && (
        <HeroProducts products={heroProducts ?? []} />
      )}
      {activeTab === 'restocks' && (
        <Restocks restocks={restocks ?? []} />
      )}
    </div>
  )
}
