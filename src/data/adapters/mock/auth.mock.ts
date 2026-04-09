import type { AuthRepository } from '@/data/repositories/types'
import orgData from '@/data/fixtures/organizations.json'
import type { Organization, Client, User } from '@/modules/shared/types'

export function createMockAuthRepository(): AuthRepository {
  return {
    async login(email: string, _password: string) {
      const user = (orgData.users as User[]).find((u) => u.email === email)
      if (!user) throw new Error('Invalid credentials')
      return { user, token: 'mock-jwt-token' }
    },
    async getOrganizations() {
      return orgData.organizations as Organization[]
    },
    async getClients(orgId: string) {
      return (orgData.clients as Client[]).filter((c) => c.organizationId === orgId)
    },
  }
}
