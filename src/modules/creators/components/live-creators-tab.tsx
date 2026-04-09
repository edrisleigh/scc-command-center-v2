import { DataTable, type Column } from '@/modules/shared/components/data-table'
import { formatCurrency, formatPercent } from '@/lib/utils'
import type { LiveCreator } from '@/modules/creators/types'

interface LiveCreatorsTabProps {
  liveCreators: LiveCreator[]
}

// We need to map LiveCreator to a Record<string, unknown> for DataTable
type LiveCreatorRow = {
  username: string
  level: string
  liveGmvP28d: number
  liveGrowthPct: number
  affiliateLiveStreams: number
  affiliateLivePct: number
  isVip: boolean
  isBrandPod: boolean
}

function toRow(c: LiveCreator): LiveCreatorRow {
  return {
    username: c.username,
    level: c.level,
    liveGmvP28d: c.liveGmvP28d,
    liveGrowthPct: c.liveGrowthPct,
    affiliateLiveStreams: c.affiliateLiveStreams,
    affiliateLivePct: c.affiliateLivePct,
    isVip: c.isVip,
    isBrandPod: c.isBrandPod,
  }
}

const columns: Column<LiveCreatorRow>[] = [
  { key: 'username', header: 'Username', sortable: true },
  { key: 'level', header: 'Level', sortable: true },
  {
    key: 'liveGmvP28d',
    header: 'LIVE GMV P28D',
    sortable: true,
    format: (v) => formatCurrency(v as number),
  },
  {
    key: 'liveGrowthPct',
    header: 'LIVE Growth %',
    sortable: true,
    format: (v) => formatPercent(v as number),
  },
  {
    key: 'affiliateLiveStreams',
    header: 'LIVE Streams',
    sortable: true,
    format: (v) => String(v),
  },
  {
    key: 'affiliateLivePct',
    header: 'Affiliate LIVE %',
    sortable: true,
    format: (v) => formatPercent(v as number),
  },
  {
    key: 'isVip',
    header: 'VIP',
    format: (v) => (v ? 'VIP' : '-'),
  },
  {
    key: 'isBrandPod',
    header: 'Brand POD',
    format: (v) => (v ? 'POD' : '-'),
  },
]

export function LiveCreatorsTab({ liveCreators }: LiveCreatorsTabProps) {
  const rows = liveCreators.map(toRow)

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Creators actively streaming LIVE with affiliate performance metrics.
      </p>
      <DataTable columns={columns} data={rows} pageSize={15} />
    </div>
  )
}
