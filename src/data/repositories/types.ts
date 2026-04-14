import type { DateRange, Organization, Client, User } from '@/modules/shared/types'
import type { ContentSubmission, SparkCode } from '@/modules/content/types'
import type { ShopDailyMetric } from '@/modules/shop/types'
import type { VideoDailyMetric } from '@/modules/videos/types'
import type { AdsDailyMetric } from '@/modules/ads/types'
import type { Creator, LiveCreator, TargetCollab, CollaborationData, CreatorIncentive } from '@/modules/creators/types'
import type { Product, SampleOrder, HeroProduct, Restock } from '@/modules/samples/types'
import type { WeeklyScorecard, MonthlyScorecard } from '@/modules/scorecards/types'

import type { CalendarEvent } from '@/modules/calendar/types'
import type { WorkflowTask } from '@/modules/workflow/types'

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

export interface CreatorRepository {
  getCreators(clientId: string): Promise<Creator[]>
  getCreatorById(clientId: string, creatorId: string): Promise<Creator | null>
  getLiveCreators(clientId: string): Promise<LiveCreator[]>
  getTargetCollabs(clientId: string): Promise<TargetCollab[]>
  getCollaborationData(clientId: string): Promise<CollaborationData[]>
  getCreatorIncentives(clientId: string): Promise<CreatorIncentive[]>
}

export interface ContentRepository {
  getContentSubmissions(clientId: string): Promise<ContentSubmission[]>
  getSparkCodes(clientId: string): Promise<SparkCode[]>
}

export interface SamplesRepository {
  getProducts(clientId: string): Promise<Product[]>
  getSampleOrders(clientId: string): Promise<SampleOrder[]>
  getHeroProducts(clientId: string): Promise<HeroProduct[]>
  getRestocks(clientId: string): Promise<Restock[]>
}

export interface ScorecardsRepository {
  getWeeklyScorecard(clientId: string): Promise<WeeklyScorecard[]>
  getMonthlyScorecard(clientId: string): Promise<MonthlyScorecard[]>
}


export interface CalendarRepository {
  getEvents(clientId: string): Promise<CalendarEvent[]>
}

export interface WorkflowRepository {
  getWorkflowTasks(clientId: string): Promise<WorkflowTask[]>
}
