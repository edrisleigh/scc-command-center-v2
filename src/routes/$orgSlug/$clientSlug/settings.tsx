import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$orgSlug/$clientSlug/settings')({
  component: () => (
    <div>
      <h2 className="text-xl font-bold text-foreground">Settings</h2>
      <p className="mt-2 text-muted">Coming in Phase 4</p>
    </div>
  ),
})
