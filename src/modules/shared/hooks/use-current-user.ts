import { useAuthStore } from '@/stores/auth.store'
import type { User } from '@/modules/shared/types'

const FALLBACK_USER: User = {
  id: 'u-local-admin',
  name: 'Edris Aleigh',
  email: 'edris@halo.com',
  role: 'admin',
  organizationId: 'org-halo',
}

export function useCurrentUser(): User {
  const user = useAuthStore((s) => s.user)
  return user ?? FALLBACK_USER
}
