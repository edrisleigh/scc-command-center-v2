import { useAuthStore } from '@/stores/auth.store'
import type { User } from '@/modules/shared/types'

export function useCurrentUser(): User {
  return useAuthStore((s) => s.user)
}
