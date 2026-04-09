import { useParams } from '@tanstack/react-router'

export function useTenant() {
  const { orgSlug, clientSlug } = useParams({ strict: false }) as {
    orgSlug?: string
    clientSlug?: string
  }
  return { orgSlug: orgSlug ?? '', clientSlug: clientSlug ?? '' }
}
