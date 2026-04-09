import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$orgSlug/$clientSlug/import')({
  component: () => (
    <div>
      <h2 className="text-xl font-bold text-foreground">Data Import</h2>
      <p className="mt-2 text-muted">Coming in Phase 2</p>
    </div>
  ),
})
