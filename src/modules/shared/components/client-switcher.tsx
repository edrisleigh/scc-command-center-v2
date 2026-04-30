import { useState } from 'react'
import { useLocation, useNavigate } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown } from 'lucide-react'
import { useTenant } from '@/modules/shared/hooks/use-tenant'
import { repositories } from '@/data'

const PAGE_SUFFIXES = [
  'shop',
  'videos',
  'ads',
  'creators',
  'content',
  'samples',
  'scorecards',
  'workflow',
  'calendar',
  'flags',
  'import',
  'settings',
] as const

function pageSuffixFromPath(pathname: string): (typeof PAGE_SUFFIXES)[number] {
  for (const suffix of PAGE_SUFFIXES) {
    if (pathname.endsWith(`/${suffix}`)) return suffix
  }
  return 'shop'
}

export function ClientSwitcher() {
  const { org, client } = useTenant()
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  const { data: clients } = useQuery({
    queryKey: ['auth', 'clients', org.id],
    queryFn: () => repositories.auth.getClients(org.id),
  })

  const suffix = pageSuffixFromPath(location.pathname)

  function pickClient(slug: string) {
    setOpen(false)
    ;(navigate as any)({
      to: `/$orgSlug/$clientSlug/${suffix}`,
      params: { orgSlug: org.slug, clientSlug: slug },
    }).catch(() => {
      ;(navigate as any)({
        to: '/$orgSlug/$clientSlug/shop',
        params: { orgSlug: org.slug, clientSlug: slug },
      })
    })
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1 rounded px-1.5 py-0.5 text-sm font-medium text-card-foreground hover:bg-muted/20"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span>{client.name}</span>
        <ChevronDown className="h-3.5 w-3.5 text-muted" />
      </button>
      {open && (
        <div
          className="absolute left-0 top-full z-30 mt-1 w-56 rounded-lg border border-border bg-card p-1 shadow-lg"
          role="listbox"
        >
          {(clients ?? []).map((c) => (
            <button
              key={c.id}
              type="button"
              role="option"
              aria-selected={c.id === client.id}
              onClick={() => pickClient(c.slug)}
              className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-sm hover:bg-muted/20 ${c.id === client.id ? 'text-primary' : 'text-card-foreground'}`}
            >
              <span>{c.name}</span>
              <span className="font-mono text-[10px] uppercase text-muted">{c.slug}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
