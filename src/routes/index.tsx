import { createFileRoute, redirect } from '@tanstack/react-router'
import { repositories } from '@/data'
import { useAuthStore } from '@/stores/auth.store'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const user = useAuthStore.getState().user
    const orgs = await repositories.auth.getOrganizations()
    const org = orgs.find((o) => o.id === user.organizationId)
    if (!org) {
      throw redirect({ to: '/login' })
    }
    const clients = await repositories.auth.getClients(org.id)
    const client = clients[0]
    if (!client) {
      throw redirect({ to: '/login' })
    }
    throw redirect({
      to: '/$orgSlug/$clientSlug/shop',
      params: { orgSlug: org.slug, clientSlug: client.slug },
    })
  },
})
