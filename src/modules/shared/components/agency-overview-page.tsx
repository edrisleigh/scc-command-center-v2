import { Link } from '@tanstack/react-router'
import { useAgencyOverview, type ClientOverview } from '@/modules/shared/hooks/use-agency-overview'
import { useOrgTenant } from '@/modules/shared/hooks/use-org-tenant'
import { formatCurrency, formatNumber } from '@/lib/utils'
import type { ShopDailyMetric } from '@/modules/shop/types'
import type { AdsDailyMetric } from '@/modules/ads/types'

function sumShop(data: ShopDailyMetric[], key: keyof ShopDailyMetric): number {
  return data.reduce((acc, d) => acc + (d[key] as number), 0)
}

function avgAds(data: AdsDailyMetric[], key: keyof AdsDailyMetric): number {
  if (data.length === 0) return 0
  return data.reduce((acc, d) => acc + (d[key] as number), 0) / data.length
}

interface CardData {
  name: string
  slug: string
  gmv: number
  orders: number
  activeCreators: number
  roas: number
}

function summarize(o: ClientOverview): CardData {
  return {
    name: o.client.name,
    slug: o.client.slug,
    gmv: sumShop(o.shop, 'gmv'),
    orders: sumShop(o.shop, 'orders'),
    activeCreators: o.creators.filter((c) => c.p28dAffiliateGmv > 0).length,
    roas: avgAds(o.ads, 'roas'),
  }
}

function ClientCard({ data, orgSlug, loading }: { data: CardData; orgSlug: string; loading: boolean }) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-base font-bold text-card-foreground">{data.name}</span>
          <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
            TikTok
          </span>
        </div>
        <Link
          to="/$orgSlug/$clientSlug/shop"
          params={{ orgSlug, clientSlug: data.slug }}
          className="text-xs font-medium text-primary hover:underline"
        >
          View Dashboard →
        </Link>
      </div>
      {loading ? (
        <div className="text-sm text-muted animate-pulse">Loading…</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="MTD GMV" value={formatCurrency(data.gmv)} />
          <Metric label="MTD Orders" value={formatNumber(data.orders)} />
          <Metric label="Active Creators" value={formatNumber(data.activeCreators)} />
          <Metric label="ROAS" value={`${data.roas.toFixed(2)}×`} />
        </div>
      )}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-1 text-xl font-bold text-card-foreground">{value}</div>
    </div>
  )
}

function AggKpiRow({ cards }: { cards: CardData[] }) {
  const totalGmv = cards.reduce((a, c) => a + c.gmv, 0)
  const totalOrders = cards.reduce((a, c) => a + c.orders, 0)
  const totalCreators = cards.reduce((a, c) => a + c.activeCreators, 0)
  const avgRoas =
    cards.length === 0 ? 0 : cards.reduce((a, c) => a + c.roas, 0) / cards.length

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {[
        { label: 'Total GMV', value: formatCurrency(totalGmv) },
        { label: 'Total Orders', value: formatNumber(totalOrders) },
        { label: 'Total Creators', value: formatNumber(totalCreators) },
        { label: 'Avg ROAS', value: `${avgRoas.toFixed(2)}×` },
      ].map(({ label, value }) => (
        <div key={label} className="rounded-lg border border-border bg-card p-4">
          <div className="text-[11px] uppercase tracking-wide text-muted">{label}</div>
          <div className="mt-1 text-2xl font-bold text-card-foreground">{value}</div>
        </div>
      ))}
    </div>
  )
}

export function AgencyOverviewPage() {
  const { org, orgSlug } = useOrgTenant()
  const { clients, isLoading } = useAgencyOverview(org.id)

  const cards: CardData[] = clients
    .map((q) => (q.data ? summarize(q.data) : null))
    .filter((c): c is CardData => c !== null)

  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-6">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold tracking-tight text-primary">SCC</span>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span>/</span>
            <span>{org.name}</span>
            <span>/</span>
            <span className="font-medium text-card-foreground">Agency Overview</span>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/$orgSlug/launch-scenarios"
            params={{ orgSlug }}
            className="text-sm font-medium text-primary hover:underline"
          >
            Launch Scenarios →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Agency Overview — {org.name}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Cross-client performance snapshot · MTD (October 2025)
          </p>
        </div>

        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">
            All Clients — Combined
          </h2>
          <AggKpiRow cards={cards} />
        </section>

        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">Clients</h2>
          {clients.length === 0 && !isLoading && (
            <div className="rounded-lg border border-border bg-card p-6 text-sm text-muted">
              This organization has no clients yet.
            </div>
          )}
          {clients.map((q, i) =>
            q.data ? (
              <ClientCard
                key={q.data.client.id}
                data={summarize(q.data)}
                orgSlug={orgSlug}
                loading={false}
              />
            ) : (
              <div key={i} className="rounded-xl border border-border bg-card p-6 text-sm text-muted animate-pulse">
                Loading client…
              </div>
            ),
          )}
        </section>
      </main>
    </div>
  )
}
