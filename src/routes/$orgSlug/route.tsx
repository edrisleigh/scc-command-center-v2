import { createFileRoute, notFound, redirect, Outlet } from '@tanstack/react-router'
import { repositories } from '@/data'
import { useAuthStore } from '@/stores/auth.store'
import { DEFAULT_FAKE_USER } from '@/lib/fake-users'
import type { Organization, User } from '@/modules/shared/types'

export const Route = createFileRoute('/$orgSlug')({
  beforeLoad: async ({ params }) => {
    const currentUser: User = useAuthStore.getState().user ?? DEFAULT_FAKE_USER
    const orgs = await repositories.auth.getOrganizations()
    const org = orgs.find((o) => o.slug === params.orgSlug)
    if (!org) throw notFound()

    if (org.id !== currentUser.organizationId) {
      const myOrg = orgs.find((o) => o.id === currentUser.organizationId)
      if (!myOrg) throw notFound()
      const myClients = await repositories.auth.getClients(myOrg.id)
      const firstClient = myClients[0]
      if (!firstClient) throw notFound()
      throw redirect({
        to: '/$orgSlug/$clientSlug/shop',
        params: { orgSlug: myOrg.slug, clientSlug: firstClient.slug },
      })
    }

    return { org, currentUser } satisfies { org: Organization; currentUser: User }
  },
  component: () => <Outlet />,
})
