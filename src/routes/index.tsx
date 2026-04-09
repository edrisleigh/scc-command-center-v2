import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({ to: '/$orgSlug/$clientSlug/shop', params: { orgSlug: 'halo', clientSlug: 'heydude' } })
  },
})
