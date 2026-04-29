export interface ContentSubmission {
  clientId: string
  id: string
  type: 'paid' | 'free'
  submissionDate: string
  creatorName: string
  creatorHandle: string
  videoUrl: string
  productName: string
  fee: number | null  // null for free content
  status: 'submitted' | 'approved' | 'denied' | 'in_progress' | 'completed'
  brandNotes: string
}

export interface SparkCode {
  clientId: string
  id: string
  creatorName: string
  creatorHandle: string
  videoUrl: string
  productName: string
  expirationDate: string
  hasPermission: boolean
}
