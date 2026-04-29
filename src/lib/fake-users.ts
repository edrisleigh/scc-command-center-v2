import organizationsData from '@/data/fixtures/organizations.json'
import type { User } from '@/modules/shared/types'

export const FAKE_USERS: User[] = organizationsData.users as User[]

export function getFakeUserById(id: string): User | null {
  return FAKE_USERS.find((u) => u.id === id) ?? null
}

export const DEFAULT_FAKE_USER: User = FAKE_USERS[0]
