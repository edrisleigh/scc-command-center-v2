import { useRouteContext } from '@tanstack/react-router'
import type { Client, Organization, User } from '@/modules/shared/types'

export function useTenant(): {
  org: Organization
  client: Client
  currentUser: User
  orgSlug: string
  clientSlug: string
} {
  const ctx = useRouteContext({ from: '/$orgSlug/$clientSlug' }) as {
    org: Organization
    client: Client
    currentUser: User
  }
  return {
    org: ctx.org,
    client: ctx.client,
    currentUser: ctx.currentUser,
    orgSlug: ctx.org.slug,
    clientSlug: ctx.client.slug,
  }
}
