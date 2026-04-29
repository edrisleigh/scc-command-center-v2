import { createFileRoute } from '@tanstack/react-router'
import { LaunchReadonlyPage } from '@/modules/launch/components/launch-readonly-page'

export const Route = createFileRoute('/$orgSlug/$clientSlug/launch')({
  component: LaunchReadonlyPage,
})
