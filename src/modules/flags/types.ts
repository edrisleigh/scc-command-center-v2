export type FlagSection =
  | 'shop-kpis'
  | 'shop-chart'
  | 'shop-channel'
  | 'shop-table'
  | 'videos'
  | 'ads'
  | 'creators'
  | 'content'
  | 'samples'
  | 'scorecards'
  | 'calendar'
  | 'workflow'

export const FLAG_SECTION_LABELS: Record<FlagSection, string> = {
  'shop-kpis': 'Shop — Key Metrics',
  'shop-chart': 'Shop — Trends',
  'shop-channel': 'Shop — Breakdown',
  'shop-table': 'Shop — Daily Table',
  videos: 'Video Performance',
  ads: 'Ads Management',
  creators: 'Creators',
  content: 'Content & Spark',
  samples: 'Samples & Products',
  scorecards: 'Scorecards',
  calendar: 'Calendar',
  workflow: 'Workflow',
}

export type FlagStatus = 'open' | 'in_progress' | 'resolved'
export type FlagPriority = 'low' | 'medium' | 'high'

export interface FlagComment {
  id: string
  author: string
  body: string
  createdAt: string
}

export interface Flag {
  id: string
  clientId: string
  section: FlagSection
  dataPointRef?: string
  description: string
  priority: FlagPriority
  status: FlagStatus
  createdAt: string
  createdBy: string
  assignee?: string
  comments: FlagComment[]
  resolvedAt?: string
}

export type FlagInput = Pick<Flag, 'section' | 'dataPointRef' | 'description' | 'priority'>
