import { useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Wrench } from 'lucide-react'
import { useAuthStore } from '@/stores/auth.store'
import { FAKE_USERS } from '@/lib/fake-users'
import { repositories } from '@/data'

// Dev-only switcher. Remove or gate behind import.meta.env.DEV when real auth lands.
export function FakeUserSwitcher() {
  const [open, setOpen] = useState(false)
  const currentUser = useAuthStore((s) => s.user)
  const setFakeUser = useAuthStore((s) => s.setFakeUser)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  async function pick(userId: string) {
    setOpen(false)
    setFakeUser(userId)
    queryClient.clear()

    const next = FAKE_USERS.find((u) => u.id === userId)
    if (!next) return
    const orgs = await repositories.auth.getOrganizations()
    const org = orgs.find((o) => o.id === next.organizationId)
    if (!org) return
    const clients = await repositories.auth.getClients(org.id)
    const firstClient = clients[0]
    if (!firstClient) return

    navigate({
      to: '/$orgSlug/$clientSlug/shop',
      params: { orgSlug: org.slug, clientSlug: firstClient.slug },
    })
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-muted/20 hover:text-card-foreground"
        title="Dev: switch fake user"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <Wrench className="h-4 w-4" />
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-1 w-64 rounded-lg border border-border bg-card p-1 shadow-lg" role="listbox">
          <div className="px-2 py-1 text-[10px] uppercase tracking-wide text-muted">
            Dev: switch fake user
          </div>
          {FAKE_USERS.map((u) => (
            <button
              key={u.id}
              type="button"
              role="option"
              aria-selected={u.id === currentUser.id}
              onClick={() => pick(u.id)}
              className={`flex w-full flex-col gap-0.5 rounded px-2 py-1.5 text-left text-sm hover:bg-muted/20 ${u.id === currentUser.id ? 'text-primary' : 'text-card-foreground'}`}
            >
              <span className="font-medium">{u.name}</span>
              <span className="text-[11px] text-muted">
                {u.email} · {u.organizationId}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
