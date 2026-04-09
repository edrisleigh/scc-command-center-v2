import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '@/stores/auth.store'

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout()
  })

  it('starts logged out', () => {
    const state = useAuthStore.getState()
    expect(state.user).toBeNull()
    expect(state.isAuthenticated).toBe(false)
  })

  it('logs in with user data', () => {
    useAuthStore.getState().login({
      id: '1',
      name: 'Edris',
      email: 'edris@halo.com',
      role: 'admin',
      organizationId: 'org-1',
    })
    const state = useAuthStore.getState()
    expect(state.user?.name).toBe('Edris')
    expect(state.isAuthenticated).toBe(true)
  })

  it('logs out', () => {
    useAuthStore.getState().login({
      id: '1',
      name: 'Edris',
      email: 'edris@halo.com',
      role: 'admin',
      organizationId: 'org-1',
    })
    useAuthStore.getState().logout()
    expect(useAuthStore.getState().user).toBeNull()
    expect(useAuthStore.getState().isAuthenticated).toBe(false)
  })
})
