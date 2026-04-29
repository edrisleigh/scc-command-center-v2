import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { User } from '@/modules/shared/types'
import { DEFAULT_FAKE_USER, getFakeUserById } from '@/lib/fake-users'

interface AuthState {
  user: User
  isAuthenticated: boolean
  setFakeUser: (userId: string) => void
  logout: () => void
}

const noopStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: DEFAULT_FAKE_USER,
      isAuthenticated: true,
      setFakeUser: (userId) => {
        const next = getFakeUserById(userId) ?? DEFAULT_FAKE_USER
        set({ user: next, isAuthenticated: true })
      },
      logout: () => set({ user: DEFAULT_FAKE_USER, isAuthenticated: true }),
    }),
    {
      name: 'scc-auth',
      partialize: (s) => ({ userId: s.user.id }),
      merge: (persisted, current) => {
        const p = (persisted as { userId?: string }) ?? {}
        const restored = p.userId ? getFakeUserById(p.userId) : null
        return { ...current, user: restored ?? current.user }
      },
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : noopStorage,
      ),
    },
  ),
)
