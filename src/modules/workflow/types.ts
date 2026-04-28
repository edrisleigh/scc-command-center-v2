export type WorkflowRole = 'affiliate_comms' | 'media_buyer' | 'scs'
export type WorkflowFrequency = 'daily' | 'weekly'

export interface WorkflowTask {
  id: string
  role: WorkflowRole
  taskName: string
  frequency: WorkflowFrequency
  dayOfWeek: number[]  // 1=Mon, 5=Fri, empty for daily
  completedThisWeek: boolean[]  // [Mon, Tue, Wed, Thu, Fri]
  goal: number  // target completions per week
  createdAt?: string
  updatedAt?: string
  updatedBy?: string
}

export type WorkflowTaskInput = Omit<
  WorkflowTask,
  'id' | 'completedThisWeek' | 'createdAt' | 'updatedAt' | 'updatedBy'
>
