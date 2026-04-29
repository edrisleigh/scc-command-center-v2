import { useRef, useState } from 'react'
import { X } from 'lucide-react'
import { computeScenario } from '@/modules/launch/calc'
import { SCENARIO_LABELS, MONTHS } from '@/modules/launch/constants'
import type { ScenarioInputs, SharedInputs, ScenarioKey } from '@/modules/launch/types'
import { formatCurrency, formatNumber, cn } from '@/lib/utils'
import { NumInput } from './num-input'
import { useModalBehavior } from '@/modules/shared/components/dialog'

type Tab = 'tts' | 'dtc' | 'amazon' | 'outputs'

interface ScenarioEditorDrawerProps {
  scenarioKey: ScenarioKey
  inputs: ScenarioInputs
  shared: SharedInputs
  open: boolean
  onChange: (next: ScenarioInputs) => void
  onClose: () => void
  onResetToTemplate: () => void
  onApply: () => void
}

const monthCols = Array.from({ length: MONTHS }, (_, i) => `M${i + 1}`)

export function ScenarioEditorDrawer(props: ScenarioEditorDrawerProps) {
  if (!props.open) return null
  return <DrawerInner {...props} />
}

function DrawerInner({
  scenarioKey, inputs, shared, onChange, onClose, onResetToTemplate, onApply,
}: ScenarioEditorDrawerProps) {
  const [tab, setTab] = useState<Tab>('tts')
  const outputs = computeScenario(inputs, shared)
  const contentRef = useRef<HTMLDivElement>(null)
  useModalBehavior(true, onClose, contentRef)

  const updateArr = (
    section: 'tts' | 'dtc',
    field: string,
    monthIdx: number,
    raw: string,
  ) => {
    const num = Number(raw)
    if (!Number.isFinite(num)) return
    const next = structuredClone(inputs) as ScenarioInputs
    const arr = (next[section] as Record<string, number[]>)[field]
    arr[monthIdx] = num
    onChange(next)
  }

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true" aria-label={`Edit ${SCENARIO_LABELS[scenarioKey]}`}>
      <button
        type="button"
        aria-label="Close drawer overlay"
        onClick={onClose}
        className="flex-1 bg-black/40"
      />
      <div ref={contentRef} className="w-full max-w-3xl bg-card border-l border-border flex flex-col">
        <header className="flex items-center justify-between px-5 py-3 border-b border-border">
          <div>
            <h2 className="text-sm font-semibold text-card-foreground">
              Edit assumptions: {SCENARIO_LABELS[scenarioKey]}
            </h2>
            <p className="text-xs text-muted">live recalc</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close drawer" className="text-muted hover:text-card-foreground">
            <X className="h-4 w-4" />
          </button>
        </header>

        <div role="tablist" className="flex gap-1 px-5 pt-3 border-b border-border">
          {(['tts', 'dtc', 'amazon', 'outputs'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                'px-3 py-2 text-xs font-medium border-b-2',
                tab === t ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-card-foreground',
              )}
            >
              {labelFor(t)}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {tab === 'tts' && (
            <Grid title="TikTok Shop" sectionKey="tts">
              <NumRow label="ROAS" field="roas" values={inputs.tts.roas} onUpdate={(i, v) => updateArr('tts', 'roas', i, v)} />
              <NumRow label="Ad Spend" field="adSpend" values={inputs.tts.adSpend} onUpdate={(i, v) => updateArr('tts', 'adSpend', i, v)} />
              <NumRow label="Ad % of GMV" field="adPctOfGmv" values={inputs.tts.adPctOfGmv} onUpdate={(i, v) => updateArr('tts', 'adPctOfGmv', i, v)} />
              <NumRow label="Samples" field="samplesPerMonth" values={inputs.tts.samplesPerMonth} onUpdate={(i, v) => updateArr('tts', 'samplesPerMonth', i, v)} />
              <NumRow label="Videos / creator" field="videosPerCreator" values={inputs.tts.videosPerCreator} onUpdate={(i, v) => updateArr('tts', 'videosPerCreator', i, v)} />
              <DerivedRow label="Active creators" values={outputs.tts.activeCreators} format={formatNumber} />
              <DerivedRow label="GMV" values={outputs.tts.gmv} format={formatCurrency} />
              <DerivedRow label="Platform profit" values={outputs.tts.platformProfit} format={formatCurrency} emphasis />
            </Grid>
          )}
          {tab === 'dtc' && (
            <Grid title="DTC (Google + Meta)" sectionKey="dtc">
              <NumRow label="Google Ad Spend" field="googleAdSpend" values={inputs.dtc.googleAdSpend} onUpdate={(i, v) => updateArr('dtc', 'googleAdSpend', i, v)} />
              <NumRow label="Meta Ad Spend" field="metaAdSpend" values={inputs.dtc.metaAdSpend} onUpdate={(i, v) => updateArr('dtc', 'metaAdSpend', i, v)} />
              <NumRow label="Google ROAS" field="googleRoas" values={inputs.dtc.googleRoas} onUpdate={(i, v) => updateArr('dtc', 'googleRoas', i, v)} />
              <NumRow label="Meta ROAS" field="metaRoas" values={inputs.dtc.metaRoas} onUpdate={(i, v) => updateArr('dtc', 'metaRoas', i, v)} />
              <DerivedRow label="Incremental revenue" values={outputs.dtc.incrementalRev} format={formatCurrency} />
              <DerivedRow label="DTC profit" values={outputs.dtc.platformProfit} format={formatCurrency} emphasis />
            </Grid>
          )}
          {tab === 'amazon' && (
            <Grid title="Amazon halo" sectionKey="amazon">
              <DerivedRow label="Multiplier" values={Array(MONTHS).fill(inputs.amazonMultiplierVsTts)} format={(v) => `${(v * 100).toFixed(0)}%`} />
              <DerivedRow label="Revenue" values={outputs.amazon.revenue} format={formatCurrency} />
              <DerivedRow label="Margin" values={outputs.amazon.productMargin} format={formatCurrency} emphasis />
            </Grid>
          )}
          {tab === 'outputs' && (
            <Grid title="All outputs" sectionKey="outputs">
              <DerivedRow label="Net profit" values={outputs.netProfit} format={formatCurrency} emphasis />
              <DerivedRow label="TTS GMV" values={outputs.tts.gmv} format={formatCurrency} />
              <DerivedRow label="DTC revenue" values={outputs.dtc.incrementalRev} format={formatCurrency} />
              <DerivedRow label="Amazon revenue" values={outputs.amazon.revenue} format={formatCurrency} />
              <DerivedRow label="Videos" values={outputs.tts.videos} format={formatNumber} />
            </Grid>
          )}
        </div>

        <footer className="flex justify-end gap-2 px-5 py-3 border-t border-border">
          <button type="button" onClick={onResetToTemplate} className="rounded-md border border-border bg-accent/40 px-3 py-1.5 text-xs hover:bg-accent">
            Reset to template
          </button>
          <button type="button" onClick={onApply} className="rounded-md border border-primary/40 bg-primary/15 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/25">
            Apply
          </button>
        </footer>
      </div>
    </div>
  )
}

function labelFor(t: Tab): string {
  return t === 'tts' ? 'TikTok Shop' : t === 'dtc' ? 'DTC' : t === 'amazon' ? 'Amazon' : 'Outputs'
}

function Grid({ title, children }: { title: string; sectionKey: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[10px] uppercase tracking-wide text-muted">{title}</p>
      <table className="w-full text-xs tabular-nums">
        <thead>
          <tr className="text-muted">
            <th className="text-left py-1 pr-3 w-40 font-medium"></th>
            {monthCols.map((m) => <th key={m} className="text-right px-2 py-1 font-medium">{m}</th>)}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}

function NumRow({
  label, values, onUpdate,
}: {
  label: string; field: string; values: number[]; onUpdate: (idx: number, raw: string) => void
}) {
  return (
    <tr>
      <td className="py-1 pr-3 text-muted">{label}</td>
      {values.map((v, i) => (
        <td key={i} className="px-1 py-1">
          <NumInput
            ariaLabel={`${label} M${i + 1}`}
            min={0}
            value={v}
            onChange={(num) => onUpdate(i, String(num))}
            className="no-spinner w-full rounded bg-primary/10 border border-primary/30 px-1.5 py-1 text-right text-primary outline-none focus:bg-primary/20"
          />
        </td>
      ))}
    </tr>
  )
}

function DerivedRow({
  label, values, format, emphasis,
}: {
  label: string; values: number[]; format: (v: number) => string; emphasis?: boolean
}) {
  return (
    <tr>
      <td className={cn('py-1 pr-3 text-muted', emphasis && 'font-semibold text-card-foreground')}>{label}</td>
      {values.map((v, i) => (
        <td
          key={i}
          className={cn(
            'px-2 py-1 text-right',
            emphasis ? 'font-semibold text-success' : 'text-card-foreground/80',
          )}
        >
          {format(v)}
        </td>
      ))}
    </tr>
  )
}
