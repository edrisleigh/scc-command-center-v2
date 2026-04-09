import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$orgSlug/overview')({
  component: () => (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-card-foreground">Agency Overview</h1>
        <p className="mt-2 text-muted">Cross-client dashboard — coming in Phase 3</p>
      </div>
    </div>
  ),
})
