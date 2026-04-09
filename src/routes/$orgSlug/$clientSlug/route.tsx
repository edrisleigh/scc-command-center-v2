import { createFileRoute, redirect } from '@tanstack/react-router'
import { ClientShell } from '@/modules/shared/components/client-shell'
import { useAuthStore } from '@/stores/auth.store'

export const Route = createFileRoute('/$orgSlug/$clientSlug')({
  beforeLoad: () => {
    const isAuthenticated = useAuthStore.getState().isAuthenticated
    if (!isAuthenticated) {
      throw redirect({ to: '/login' })
    }
  },
  component: ClientShell,
})
