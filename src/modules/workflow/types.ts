export interface WorkflowTask {
  id: string
  role: 'affiliate_comms' | 'media_buyer' | 'scs'
  taskName: string
  frequency: 'daily' | 'weekly'
  dayOfWeek: number[]  // 1=Mon, 5=Fri, empty for daily
  completedThisWeek: boolean[]  // [Mon, Tue, Wed, Thu, Fri]
  goal: number  // target completions per week
}
