export interface PlanningPeriod {
  id: string
  quarter: number
  year: number
  objective: string
  goal: string
  targets: PlanningMetrics
  actuals: PlanningMetrics
}

export interface PlanningMetrics {
  gmv: number
  cos: number
  adSpend: number
  samples: number
  videosPosted: number
  roas: number
}

export interface StrategyLever {
  id: string
  name: string
  tasks: StrategyTask[]
}

export interface StrategyTask {
  id: string
  task: string
  owner: string
  dueDate: string | null
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked'
  notes: string
}
