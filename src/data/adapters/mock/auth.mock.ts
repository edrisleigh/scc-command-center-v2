import type { AuthRepository } from '@/data/repositories/types'
import type { Organization, Client, User } from '@/modules/shared/types'

const mockUsers: User[] = [
  { id: 'user-1', name: 'Edris Aleigh', email: 'edris@halo.com', role: 'admin', organizationId: 'org-1' },
]

const mockOrganizations: Organization[] = [
  { id: 'org-1', name: 'Halo Agency', slug: 'halo' },
]

const mockClients: Client[] = [
  { id: 'client-1', organizationId: 'org-1', name: 'HEYDUDE', slug: 'heydude', platform: 'tiktok' },
  { id: 'client-2', organizationId: 'org-1', name: 'Brand B', slug: 'brand-b', platform: 'tiktok' },
]

export function createMockAuthRepository(): AuthRepository {
  return {
    async login(email: string, _password: string) {
      const user = mockUsers.find((u) => u.email === email)
      if (!user) {
        // Accept any email for demo — create a temp user
        return {
          user: { id: 'user-demo', name: 'Demo User', email, role: 'member' as const, organizationId: 'org-1' },
          token: 'mock-jwt-token',
        }
      }
      return { user, token: 'mock-jwt-token' }
    },
    async getOrganizations() {
      return mockOrganizations
    },
    async getClients(orgId: string) {
      return mockClients.filter((c) => c.organizationId === orgId)
    },
  }
}
