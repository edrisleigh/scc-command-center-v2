import { createFileRoute } from '@tanstack/react-router'
import { AgencyOverviewPage } from '@/modules/shared/components/agency-overview-page'

export const Route = createFileRoute('/$orgSlug/overview')({
  component: AgencyOverviewPage,
})
