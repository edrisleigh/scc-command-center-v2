import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid } from 'recharts'
import type { ScenarioOutputs, ScenarioKey } from '@/modules/launch/types'
import { SCENARIO_LABELS, MONTHS } from '@/modules/launch/constants'

const COLORS: Record<ScenarioKey, string> = {
  conservative: '#94a3b8',
  balanced: '#a5b4fc',
  aggressive: '#86efac',
  rapid_scale: '#fbbf24',
}

interface ScenarioComparisonChartProps {
  outputs: Record<ScenarioKey, ScenarioOutputs>
  chosenScenarioKey: ScenarioKey | null
}

export function ScenarioComparisonChart({ outputs, chosenScenarioKey }: ScenarioComparisonChartProps) {
  const data = Array.from({ length: MONTHS }, (_, m) => ({
    month: `M${m + 1}`,
    conservative: outputs.conservative.netProfit[m],
    balanced: outputs.balanced.netProfit[m],
    aggressive: outputs.aggressive.netProfit[m],
    rapid_scale: outputs.rapid_scale.netProfit[m],
  }))

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted">
        Net profit trajectory · all 4 scenarios
      </h3>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
          <Tooltip
            formatter={(v) => `$${Number(v).toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
            contentStyle={{ background: '#0e1118', border: '1px solid rgba(255,255,255,0.1)', fontSize: 12 }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          {(['conservative', 'balanced', 'aggressive', 'rapid_scale'] as ScenarioKey[]).map((k) => (
            <Line
              key={k}
              type="monotone"
              dataKey={k}
              name={SCENARIO_LABELS[k] + (chosenScenarioKey === k ? ' ★' : '')}
              stroke={COLORS[k]}
              strokeWidth={chosenScenarioKey === k ? 3 : 1.5}
              dot={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
