import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$orgSlug/$clientSlug/samples')({
  component: () => (
    <div>
      <h2 className="text-xl font-bold text-foreground">Samples &amp; Products</h2>
      <p className="mt-2 text-muted">Coming in Phase 2</p>
    </div>
  ),
})
