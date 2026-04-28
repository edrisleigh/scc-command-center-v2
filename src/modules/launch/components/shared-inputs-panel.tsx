import type { SharedInputs } from '@/modules/launch/types'
import { NumInput } from './num-input'

interface SharedInputsPanelProps {
  value: SharedInputs
  onChange: (next: SharedInputs) => void
  readOnly?: boolean
}

interface Field {
  key: keyof SharedInputs
  label: string
  format: 'currency' | 'percent'
  min?: number
}

const FIELDS: Field[] = [
  { key: 'aov', label: 'AOV', format: 'currency', min: 0.01 },
  { key: 'cogsPercent', label: 'COGS %', format: 'percent', min: 0 },
  { key: 'shippingPerUnit', label: 'Shipping / unit', format: 'currency', min: 0 },
  { key: 'creatorCommissionPct', label: 'Creator commission', format: 'percent', min: 0 },
  { key: 'platformFeePct', label: 'Platform fee', format: 'percent', min: 0 },
]

export function SharedInputsPanel({ value, onChange, readOnly }: SharedInputsPanelProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
      {FIELDS.map((f) => {
        const raw = value[f.key]
        return (
          <label key={f.key} className="block rounded-lg border border-border bg-card p-3">
            <div className="text-[10px] uppercase tracking-wide text-muted">{f.label}</div>
            <div className="mt-1 flex items-baseline gap-1">
              {f.format === 'currency' && <span className="text-sm text-muted">$</span>}
              <NumInput
                value={raw}
                disabled={readOnly}
                min={f.min}
                onChange={(num) => onChange({ ...value, [f.key]: num })}
                className="no-spinner w-full bg-transparent text-base font-semibold text-card-foreground outline-none focus:ring-0 disabled:cursor-not-allowed"
              />
              {f.format === 'percent' && <span className="text-sm text-muted">×</span>}
            </div>
            {f.key === 'aov' && raw <= 0 && (
              <p className="mt-1 text-[11px] text-danger">AOV must be greater than 0</p>
            )}
          </label>
        )
      })}
    </div>
  )
}
