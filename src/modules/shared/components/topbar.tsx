import { DateRangePicker } from './date-range-picker'
import { useTenant } from '@/modules/shared/hooks/use-tenant'
import { GlobalFreshnessChip } from '@/modules/freshness/components/global-freshness-chip'

export function Topbar() {
  const { orgSlug, clientSlug } = useTenant()

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold tracking-tight text-primary">SCC</span>
        {orgSlug && (
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <span>/</span>
            <span className="capitalize">{orgSlug}</span>
            {clientSlug && (
              <>
                <span>/</span>
                <span className="font-medium capitalize text-card-foreground">{clientSlug}</span>
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-4">
        {clientSlug && <GlobalFreshnessChip />}
        <DateRangePicker />
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          EA
        </div>
      </div>
    </header>
  )
}
