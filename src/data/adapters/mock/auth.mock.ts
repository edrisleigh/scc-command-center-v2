import type { AuthRepository } from '@/data/repositories/types'
import type { Organization, Client, User } from '@/modules/shared/types'
import data from '@/data/fixtures/organizations.json'

const organizations = data.organizations as Organization[]
const clients = data.clients as Client[]
const users = data.users as User[]

export function createMockAuthRepository(): AuthRepository {
  return {
    async login(email: string, _password: string) {
      const user = users.find((u) => u.email === email)
      if (!user) {
        return {
          user: {
            id: 'user-demo',
            name: 'Demo User',
            email,
            role: 'member' as const,
            organizationId: 'org-1',
          },
          token: 'mock-jwt-token',
        }
      }
      return { user, token: 'mock-jwt-token' }
    },
    async getOrganizations() {
      return organizations
    },
    async getClients(orgId: string) {
      return clients.filter((c) => c.organizationId === orgId)
    },
  }
}
