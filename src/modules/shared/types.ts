export interface Organization {
  id: string
  name: string
  slug: string
}

export interface Client {
  id: string
  organizationId: string
  name: string
  slug: string
  platform: 'tiktok'
}

export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'member'
  organizationId: string
}

export interface DateRange {
  from: Date
  to: Date
}

export interface KpiMetric {
  label: string
  value: number
  previousValue: number | null
  format: 'currency' | 'number' | 'percent'
}
