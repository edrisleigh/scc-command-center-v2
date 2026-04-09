import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/$orgSlug/$clientSlug/shop')({
  component: () => (
    <div>
      <h2 className="text-xl font-bold text-foreground">Shop Analytics</h2>
      <p className="text-sm text-muted">Loading... (will be replaced in Task 9)</p>
    </div>
  ),
})
