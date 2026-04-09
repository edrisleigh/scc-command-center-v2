import { createFileRoute } from '@tanstack/react-router'
import { ClientShell } from '@/modules/shared/components/client-shell'

export const Route = createFileRoute('/$orgSlug/$clientSlug')({
  component: ClientShell,
})
