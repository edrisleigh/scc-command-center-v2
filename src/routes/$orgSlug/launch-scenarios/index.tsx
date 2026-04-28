import { createFileRoute } from '@tanstack/react-router'
import { LaunchListPage } from '@/modules/launch/components/launch-list-page'

export const Route = createFileRoute('/$orgSlug/launch-scenarios/')({
  component: LaunchListPage,
})
