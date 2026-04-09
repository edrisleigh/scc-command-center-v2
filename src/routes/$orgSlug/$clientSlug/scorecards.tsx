import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$orgSlug/$clientSlug/scorecards')({
  component: () => (
    <div>
      <h2 className="text-xl font-bold text-foreground">Scorecards</h2>
      <p className="mt-2 text-muted">Coming in Phase 3</p>
    </div>
  ),
})
