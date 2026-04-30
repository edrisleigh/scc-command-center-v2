import type { DateRange, Organization, Client, User } from '@/modules/shared/types'
import type { ContentSubmission, SparkCode } from '@/modules/content/types'
import type { ShopDailyMetric } from '@/modules/shop/types'
import type { VideoDailyMetric } from '@/modules/videos/types'
import type { AdsDailyMetric } from '@/modules/ads/types'
import type { Creator, LiveCreator, TargetCollab, CollaborationData, CreatorIncentive } from '@/modules/creators/types'
import type { Product, SampleOrder, HeroProduct, Restock } from '@/modules/samples/types'
import type { WeeklyScorecard, MonthlyScorecard } from '@/modules/scorecards/types'

import type { CalendarEvent, CalendarEventInput } from '@/modules/calendar/types'
import type { WorkflowTask, WorkflowTaskInput } from '@/modules/workflow/types'
import type { FreshnessRecord, DataSource } from '@/modules/freshness/types'
import type { Flag, FlagInput, FlagStatus } from '@/modules/flags/types'
import type { LaunchScenario } from '@/modules/launch/types'

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
  getEvents(orgId: string, clientId: string): Promise<CalendarEvent[]>
  createEvent(
    orgId: string,
    clientId: string,
    input: CalendarEventInput,
    actor: string,
  ): Promise<CalendarEvent>
  updateEvent(
    orgId: string,
    clientId: string,
    id: string,
    patch: Partial<CalendarEventInput>,
    actor: string,
  ): Promise<CalendarEvent>
  deleteEvent(orgId: string, clientId: string, id: string): Promise<void>
}

export interface WorkflowRepository {
  getWorkflowTasks(orgId: string, clientId: string): Promise<WorkflowTask[]>
  createTask(
    orgId: string,
    clientId: string,
    input: WorkflowTaskInput,
    actor: string,
  ): Promise<WorkflowTask>
  updateTask(
    orgId: string,
    clientId: string,
    id: string,
    patch: Partial<Omit<WorkflowTask, 'id' | 'createdAt'>>,
    actor: string,
  ): Promise<WorkflowTask>
  deleteTask(orgId: string, clientId: string, id: string): Promise<void>
}

export interface FreshnessRepository {
  getFreshness(orgId: string, clientId: string): Promise<FreshnessRecord[]>
  recordRefresh(
    orgId: string,
    clientId: string,
    dataSource: DataSource,
    actor: string,
  ): Promise<FreshnessRecord>
}

export interface FlagsRepository {
  getFlags(orgId: string, clientId: string): Promise<Flag[]>
  createFlag(orgId: string, clientId: string, input: FlagInput, actor: string): Promise<Flag>
  updateFlagStatus(
    orgId: string,
    clientId: string,
    id: string,
    status: FlagStatus,
    actor: string,
  ): Promise<Flag>
  assignFlag(orgId: string, clientId: string, id: string, assignee: string): Promise<Flag>
  addComment(orgId: string, clientId: string, id: string, body: string, actor: string): Promise<Flag>
  deleteFlag(orgId: string, clientId: string, id: string): Promise<void>
}

export interface LaunchRepository {
  list(orgSlug: string): Promise<LaunchScenario[]>
  getById(scenarioId: string): Promise<LaunchScenario | null>
  getByClientSlug(orgSlug: string, clientSlug: string): Promise<LaunchScenario | null>
  create(input: { orgSlug: string; prospectName: string; name: string }): Promise<LaunchScenario>
  save(scenario: LaunchScenario): Promise<LaunchScenario>
  lock(scenarioId: string, chosenScenarioKey: import('@/modules/launch/types').ScenarioKey): Promise<LaunchScenario>
  linkToClient(scenarioId: string, clientSlug: string): Promise<LaunchScenario>
}
