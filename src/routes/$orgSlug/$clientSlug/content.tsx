import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$orgSlug/$clientSlug/content')({
  component: () => (
    <div>
      <h2 className="text-xl font-bold text-foreground">Content &amp; Spark Codes</h2>
      <p className="mt-2 text-muted">Coming in Phase 2</p>
    </div>
  ),
})
