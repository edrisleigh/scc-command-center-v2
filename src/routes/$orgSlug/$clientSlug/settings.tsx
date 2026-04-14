import { createFileRoute } from '@tanstack/react-router'
import { SettingsPage } from '@/modules/shared/components/settings-page'

export const Route = createFileRoute('/$orgSlug/$clientSlug/settings')({
  component: SettingsPage,
})
