import { useState } from "react";
import { TimeSeriesChart } from "@/modules/shared/components/time-series-chart";
import { formatCurrency, formatNumber, formatCompactNumber } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { ShopDailyMetric } from "@/modules/shop/types";

type Tab = "revenue" | "orders" | "traffic" | "channels";

interface ShopChartProps {
  data: ShopDailyMetric[];
}

const TABS: { id: Tab; label: string }[] = [
  { id: "revenue", label: "Revenue" },
  { id: "orders", label: "Orders" },
  { id: "traffic", label: "Traffic" },
  { id: "channels", label: "Channels" },
];

export function ShopChart({ data }: ShopChartProps) {
  const [tab, setTab] = useState<Tab>("revenue");

  const chartData = data as unknown as Record<string, unknown>[];
  console.log("chart data", chartData);

  if (data.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 flex items-center justify-center h-64">
        <p className="text-sm text-muted">
          No data for the selected date range.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      {/* Tab nav */}
      <div className="flex items-center gap-0.5 border-b border-border px-5 py-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
              tab === t.id
                ? "bg-amber-500/10 text-amber-500"
                : "text-muted hover:text-card-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="p-1">
        {tab === "revenue" && (
          <TimeSeriesChart
            title="GMV & Gross Revenue"
            data={chartData}
            dataKey="gmv"
            secondaryDataKey="grossRevenue"
            xAxisKey="date"
            color="#f59e0b"
            secondaryColor="#14b8a6"
            valueFormatter={formatCurrency}
          />
        )}
        {tab === "orders" && (
          <TimeSeriesChart
            title="Orders & Customers"
            data={chartData}
            dataKey="orders"
            secondaryDataKey="customers"
            xAxisKey="date"
            color="#f59e0b"
            secondaryColor="#a78bfa"
            valueFormatter={formatNumber}
          />
        )}
        {tab === "traffic" && (
          <TimeSeriesChart
            title="Visitors & Page Views"
            data={chartData}
            dataKey="visitors"
            secondaryDataKey="pageViews"
            xAxisKey="date"
            color="#60a5fa"
            secondaryColor="#34d399"
            valueFormatter={formatCompactNumber}
          />
        )}
        {tab === "channels" && (
          <TimeSeriesChart
            title="Video GMV & LIVE GMV"
            data={chartData}
            dataKey="videoGmv"
            secondaryDataKey="liveGmv"
            xAxisKey="date"
            color="#a78bfa"
            secondaryColor="#34d399"
            valueFormatter={formatCurrency}
          />
        )}
      </div>
    </div>
  );
}
