import { createFileRoute, Link } from '@tanstack/react-router'
import { ClientShell } from '@/modules/shared/components/client-shell'

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <h2 className="text-2xl font-bold text-foreground">Page not found</h2>
      <p className="mt-2 text-sm text-muted">The page you're looking for doesn't exist.</p>
      <Link to="/" className="mt-4 text-sm font-medium text-primary hover:underline">
        Go home
      </Link>
    </div>
  )
}

export const Route = createFileRoute('/$orgSlug/$clientSlug')({
  component: ClientShell,
  notFoundComponent: NotFound,
})
