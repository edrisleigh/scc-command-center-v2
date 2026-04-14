import { useState, useRef, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { format, parseISO, startOfWeek, startOfMonth } from "date-fns";
import { cn } from "@/lib/utils";

type Granularity = "daily" | "weekly" | "monthly";

interface TimeSeriesChartProps {
  title: string;
  data: Record<string, unknown>[];
  dataKey: string;
  secondaryDataKey?: string;
  xAxisKey: string;
  color?: string;
  secondaryColor?: string;
  valueFormatter?: (value: number) => string;
}

function aggregateData(
  data: Record<string, unknown>[],
  xAxisKey: string,
  dataKey: string,
  secondaryDataKey: string | undefined,
  granularity: Granularity,
): Record<string, unknown>[] {
  if (granularity === "daily") return data;

  const groups = new Map<string, Record<string, unknown>[]>();
  for (const row of data) {
    const dateStr = row[xAxisKey] as string;
    const date = parseISO(dateStr);
    const key =
      granularity === "weekly"
        ? format(startOfWeek(date, { weekStartsOn: 1 }), "yyyy-MM-dd")
        : format(startOfMonth(date), "yyyy-MM");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(row);
  }

  return Array.from(groups.entries()).map(([key, rows]) => {
    const result: Record<string, unknown> = { [xAxisKey]: key };
    result[dataKey] = rows.reduce((sum, r) => sum + (r[dataKey] as number), 0);
    if (secondaryDataKey) {
      result[secondaryDataKey] = rows.reduce(
        (sum, r) => sum + (r[secondaryDataKey] as number),
        0,
      );
    }
    return result;
  });
}

export function TimeSeriesChart({
  title,
  data,
  dataKey,
  secondaryDataKey,
  xAxisKey,
  color = "#a78bfa",
  secondaryColor = "#60a5fa",
  valueFormatter = (v) => v.toLocaleString(),
}: TimeSeriesChartProps) {
  const [granularity, setGranularity] = useState<Granularity>("daily");
  const [width, setWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setWidth(Math.round(w));
    };

    update();

    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const chartData = aggregateData(
    data,
    xAxisKey,
    dataKey,
    secondaryDataKey,
    granularity,
  );

  const granularityOptions: { value: Granularity; label: string }[] = [
    { value: "daily", label: "Daily" },
    { value: "weekly", label: "Weekly" },
    { value: "monthly", label: "Monthly" },
  ];

  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="text-sm font-semibold text-card-foreground">
          {title}
        </span>
        <div className="flex gap-2">
          {granularityOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setGranularity(opt.value)}
              className={cn(
                "rounded px-2.5 py-1 text-xs",
                granularity === opt.value
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:text-card-foreground",
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <div ref={containerRef} style={{ height: 240, width: "100%" }}>
        {width > 0 && (
          <AreaChart width={width} height={240} data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.06)"
            />
            <XAxis
              dataKey={xAxisKey}
              tick={{ fill: "#888", fontSize: 11 }}
              tickFormatter={(v) => {
                if (granularity === "monthly") return v;
                return format(parseISO(v), "MMM d");
              }}
            />
            <YAxis
              tick={{ fill: "#888", fontSize: 11 }}
              tickFormatter={(v) => valueFormatter(v)}
            />
            <Tooltip
              contentStyle={{
                background: "#1a1a2e",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 8,
                color: "#e0e0e0",
              }}
              formatter={(v) => valueFormatter(Number(v))}
            />
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              fill={color}
              fillOpacity={0.1}
            />
            {secondaryDataKey && (
              <Area
                type="monotone"
                dataKey={secondaryDataKey}
                stroke={secondaryColor}
                fill={secondaryColor}
                fillOpacity={0.05}
              />
            )}
          </AreaChart>
        )}
      </div>
    </div>
  );
}
