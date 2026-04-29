import { createFileRoute } from '@tanstack/react-router'
import { LaunchDetailPage } from '@/modules/launch/components/launch-detail-page'

export const Route = createFileRoute('/$orgSlug/launch-scenarios/$scenarioId')({
  component: LaunchDetailPage,
})
