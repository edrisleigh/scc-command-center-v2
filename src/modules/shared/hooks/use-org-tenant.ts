import { useRouteContext } from '@tanstack/react-router'
import type { Organization, User } from '@/modules/shared/types'

export function useOrgTenant(): {
  org: Organization
  currentUser: User
  orgSlug: string
} {
  const ctx = useRouteContext({ from: '/$orgSlug' }) as {
    org: Organization
    currentUser: User
  }
  return {
    org: ctx.org,
    currentUser: ctx.currentUser,
    orgSlug: ctx.org.slug,
  }
}
