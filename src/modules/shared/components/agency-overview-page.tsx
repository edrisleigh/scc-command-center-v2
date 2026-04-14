import { Link, useParams } from "@tanstack/react-router";
import { useAgencyOverview } from "@/modules/shared/hooks/use-agency-overview";
import { formatCurrency, formatNumber } from "@/lib/utils";
import type { ShopDailyMetric } from "@/modules/shop/types";
import type { AdsDailyMetric } from "@/modules/ads/types";
import type { Creator } from "@/modules/creators/types";

function sumShop(data: ShopDailyMetric[], key: keyof ShopDailyMetric): number {
  return data.reduce((acc, d) => acc + (d[key] as number), 0);
}

function avgAds(data: AdsDailyMetric[], key: keyof AdsDailyMetric): number {
  if (data.length === 0) return 0;
  return data.reduce((acc, d) => acc + (d[key] as number), 0) / data.length;
}

const BRAND_B_MOCK = {
  name: "Brand B",
  slug: null, // no real dashboard yet
  gmv: 184_320,
  orders: 3_210,
  activeCreators: 28,
  roas: 3.1,
};

interface ClientCardProps {
  name: string;
  slug: string | null;
  orgSlug: string;
  gmv: number;
  orders: number;
  activeCreators: number;
  roas: number;
  loading?: boolean;
}

function ClientCard({
  name,
  slug,
  orgSlug,
  gmv,
  orders,
  activeCreators,
  roas,
  loading,
}: ClientCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-base font-bold text-card-foreground">
            {name}
          </span>
          <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-primary">
            TikTok
          </span>
        </div>
        {slug ? (
          <Link
            to="/$orgSlug/$clientSlug/shop"
            params={{ orgSlug, clientSlug: slug }}
            className="text-xs font-medium text-primary hover:underline"
          >
            View Dashboard →
          </Link>
        ) : (
          <span className="text-xs text-muted">Coming soon</span>
        )}
      </div>

      {/* Metrics grid */}
      {loading ? (
        <div className="text-sm text-muted animate-pulse">Loading…</div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Metric label="MTD GMV" value={formatCurrency(gmv)} />
          <Metric label="MTD Orders" value={formatNumber(orders)} />
          <Metric
            label="Active Creators"
            value={formatNumber(activeCreators)}
          />
          <Metric label="ROAS" value={`${roas.toFixed(2)}×`} />
        </div>
      )}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wide text-muted">
        {label}
      </div>
      <div className="mt-1 text-xl font-bold text-card-foreground">{value}</div>
    </div>
  );
}

interface AggKpiRowProps {
  totalGmv: number;
  totalOrders: number;
  totalCreators: number;
  avgRoas: number;
}

function AggKpiRow({
  totalGmv,
  totalOrders,
  totalCreators,
  avgRoas,
}: AggKpiRowProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {[
        { label: "Total GMV", value: formatCurrency(totalGmv) },
        { label: "Total Orders", value: formatNumber(totalOrders) },
        { label: "Total Creators", value: formatNumber(totalCreators) },
        { label: "Avg ROAS", value: `${avgRoas.toFixed(2)}×` },
      ].map(({ label, value }) => (
        <div
          key={label}
          className="rounded-lg border border-border bg-card p-4"
        >
          <div className="text-[11px] uppercase tracking-wide text-muted">
            {label}
          </div>
          <div className="mt-1 text-2xl font-bold text-card-foreground">
            {value}
          </div>
        </div>
      ))}
    </div>
  );
}

export function AgencyOverviewPage() {
  const { orgSlug } = useParams({ strict: false }) as { orgSlug: string };
  const { clients } = useAgencyOverview();
  const [heydude] = clients;
  console.log(heydude);

  // Derive HEYDUDE metrics
  const heydudeData = heydude.data;
  const heydudeGmv = heydudeData ? sumShop(heydudeData.shop, "gmv") : 0;
  const heydudeOrders = heydudeData ? sumShop(heydudeData.shop, "orders") : 0;
  const heydudeCreators = heydudeData
    ? (heydudeData.creators as Creator[]).filter((c) => c.p28dAffiliateGmv > 0)
        .length
    : 0;
  const heydudeRoas = heydudeData ? avgAds(heydudeData.ads, "roas") : 0;

  // Aggregate across both clients (HEYDUDE + Brand B static mock)
  const totalGmv = heydudeGmv + BRAND_B_MOCK.gmv;
  const totalOrders = heydudeOrders + BRAND_B_MOCK.orders;
  const totalCreators = heydudeCreators + BRAND_B_MOCK.activeCreators;
  const avgRoas = heydude.isLoading ? 0 : (heydudeRoas + BRAND_B_MOCK.roas) / 2;

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-6">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold tracking-tight text-primary">
            SCC
          </span>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span>/</span>
            <span className="capitalize">{orgSlug}</span>
            <span>/</span>
            <span className="font-medium text-card-foreground">
              Agency Overview
            </span>
          </div>
        </div>
        <Link
          to="/$orgSlug/$clientSlug/shop"
          params={{ orgSlug, clientSlug: "heydude" }}
          className="text-sm font-medium text-primary hover:underline"
        >
          ← Back to client
        </Link>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-6 py-8 space-y-8">
        {/* Page heading */}
        <div>
          <h1 className="text-2xl font-bold text-foreground capitalize">
            Agency Overview — {orgSlug}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Cross-client performance snapshot · MTD (October 2025)
          </p>
        </div>

        {/* Aggregate KPIs */}
        <section>
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">
            All Clients — Combined
          </h2>
          <AggKpiRow
            totalGmv={totalGmv}
            totalOrders={totalOrders}
            totalCreators={totalCreators}
            avgRoas={avgRoas}
          />
        </section>

        {/* Client cards */}
        <section className="space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">
            Clients
          </h2>

          <ClientCard
            name="HEYDUDE"
            slug="heydude"
            orgSlug={orgSlug}
            gmv={heydudeGmv}
            orders={heydudeOrders}
            activeCreators={heydudeCreators}
            roas={heydudeRoas}
            // loading={heydude.isLoading}
          />

          <ClientCard
            name={BRAND_B_MOCK.name}
            slug={BRAND_B_MOCK.slug}
            orgSlug={orgSlug}
            gmv={BRAND_B_MOCK.gmv}
            orders={BRAND_B_MOCK.orders}
            activeCreators={BRAND_B_MOCK.activeCreators}
            roas={BRAND_B_MOCK.roas}
          />
        </section>
      </main>
    </div>
  );
}
