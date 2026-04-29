import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '@/stores/auth.store'
import { DEFAULT_FAKE_USER } from '@/lib/fake-users'

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.getState().logout()
  })

  it('starts with default fake user', () => {
    const state = useAuthStore.getState()
    expect(state.user).toEqual(DEFAULT_FAKE_USER)
    expect(state.isAuthenticated).toBe(true)
  })

  it('switches to a different fake user by id', () => {
    useAuthStore.getState().setFakeUser('user-2')
    const state = useAuthStore.getState()
    expect(state.user.id).toBe('user-2')
    expect(state.user.name).toBe('Jordan Taylor')
    expect(state.isAuthenticated).toBe(true)
  })

  it('falls back to default user on unknown id', () => {
    useAuthStore.getState().setFakeUser('nonexistent-id')
    const state = useAuthStore.getState()
    expect(state.user).toEqual(DEFAULT_FAKE_USER)
    expect(state.isAuthenticated).toBe(true)
  })

  it('logout resets to default fake user', () => {
    useAuthStore.getState().setFakeUser('user-2')
    useAuthStore.getState().logout()
    const state = useAuthStore.getState()
    expect(state.user).toEqual(DEFAULT_FAKE_USER)
    expect(state.isAuthenticated).toBe(true)
  })
})
