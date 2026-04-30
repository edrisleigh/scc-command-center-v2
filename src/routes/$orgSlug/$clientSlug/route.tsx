import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { ClientShell } from '@/modules/shared/components/client-shell'
import { repositories } from '@/data'
import type { Client, Organization, User } from '@/modules/shared/types'

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h2 className="text-2xl font-bold text-foreground">Page not found</h2>
      <p className="mt-2 text-sm text-muted">The page you're looking for doesn't exist.</p>
      <Link to="/" className="mt-4 text-sm font-medium text-primary hover:underline">
        Go home
      </Link>
    </div>
  )
}

export const Route = createFileRoute('/$orgSlug/$clientSlug')({
  beforeLoad: async ({ params, context }) => {
    const { org, currentUser } = context as {
      org: Organization
      currentUser: User
    }
    const clients = await repositories.auth.getClients(org.id)
    const client = clients.find((c) => c.slug === params.clientSlug)
    if (!client) throw notFound()
    return { org, client, currentUser } satisfies {
      org: Organization
      client: Client
      currentUser: User
    }
  },
  component: ClientShell,
  notFoundComponent: NotFound,
})
