import { createFileRoute } from '@tanstack/react-router'
import { ImportPage } from '@/modules/import/components/import-page'

export const Route = createFileRoute('/$orgSlug/$clientSlug/import')({
  component: ImportPage,
})
