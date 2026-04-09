import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: IndexPage,
})

function IndexPage() {
  // TODO: Replace with redirect to /$orgSlug/$clientSlug/shop once that route exists
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary">SCC Command Center</h1>
        <p className="mt-4 text-muted">TikTok Shop Analytics Dashboard</p>
      </div>
    </div>
  )
}
