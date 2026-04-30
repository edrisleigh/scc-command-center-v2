import { DateRangePicker } from './date-range-picker'
import { useTenant } from '@/modules/shared/hooks/use-tenant'
import { GlobalFreshnessChip } from '@/modules/freshness/components/global-freshness-chip'
import { ClientSwitcher } from './client-switcher'
import { FakeUserSwitcher } from './fake-user-switcher'

export function Topbar() {
  const { org } = useTenant()

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-6">
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold tracking-tight text-primary">SCC</span>
        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <span>/</span>
          <span>{org.name}</span>
          <span>/</span>
          <ClientSwitcher />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <GlobalFreshnessChip />
        <DateRangePicker />
        <FakeUserSwitcher />
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          EA
        </div>
      </div>
    </header>
  )
}
