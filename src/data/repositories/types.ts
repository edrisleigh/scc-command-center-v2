import type { DateRange, Organization, Client, User } from '@/modules/shared/types'
import type { ShopDailyMetric } from '@/modules/shop/types'
import type { VideoDailyMetric } from '@/modules/videos/types'
import type { AdsDailyMetric } from '@/modules/ads/types'

export interface AuthRepository {
  login(email: string, password: string): Promise<{ user: User; token: string }>
  getOrganizations(): Promise<Organization[]>
  getClients(orgId: string): Promise<Client[]>
}

export interface ShopRepository {
  getDailyMetrics(clientId: string, range: DateRange): Promise<ShopDailyMetric[]>
}

export interface VideoRepository {
  getDailyMetrics(clientId: string, range: DateRange): Promise<VideoDailyMetric[]>
}

export interface AdsRepository {
  getDailyMetrics(clientId: string, range: DateRange): Promise<AdsDailyMetric[]>
}
