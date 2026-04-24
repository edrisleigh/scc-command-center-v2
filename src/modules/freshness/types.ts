export type DataSource =
  | 'shop-daily'
  | 'video-daily'
  | 'ads-daily'
  | 'creators'
  | 'content'
  | 'samples'
  | 'scorecards'
  | 'calendar'
  | 'workflow'

export interface FreshnessRecord {
  clientId: string
  dataSource: DataSource
  updatedAt: string
  updatedBy: string
}

export const DATA_SOURCE_LABELS: Record<DataSource, string> = {
  'shop-daily': 'Shop Analytics',
  'video-daily': 'Video Performance',
  'ads-daily': 'Ads Management',
  creators: 'Creators',
  content: 'Content & Spark',
  samples: 'Samples & Products',
  scorecards: 'Scorecards',
  calendar: 'Calendar',
  workflow: 'Workflow',
}
