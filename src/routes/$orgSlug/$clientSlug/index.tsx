import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/$orgSlug/$clientSlug/')({
  beforeLoad: ({ params }) => {
    throw redirect({ to: '/$orgSlug/$clientSlug/shop', params })
  },
})
