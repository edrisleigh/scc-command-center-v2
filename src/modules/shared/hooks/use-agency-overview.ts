import { useQueries, useQuery } from '@tanstack/react-query'
import { repositories } from '@/data'
import type { Client } from '@/modules/shared/types'

const RANGE = {
  from: new Date('2025-10-01'),
  to: new Date('2025-10-31'),
}

export interface ClientOverview {
  client: Client
  shop: Awaited<ReturnType<typeof repositories.shop.getDailyMetrics>>
  ads: Awaited<ReturnType<typeof repositories.ads.getDailyMetrics>>
  creators: Awaited<ReturnType<typeof repositories.creators.getCreators>>
}

export function useAgencyOverview(orgId: string): {
  isLoading: boolean
  clients: Array<{ data: ClientOverview | undefined; isLoading: boolean }>
} {
  const clientsQuery = useQuery({
    queryKey: ['agency', 'overview', 'clients', orgId],
    queryFn: () => repositories.auth.getClients(orgId),
  })

  const clients = clientsQuery.data ?? []

  const queries = useQueries({
    queries: clients.map((client) => ({
      queryKey: [
        'agency',
        'overview',
        'client',
        orgId,
        client.id,
        RANGE.from.toISOString(),
        RANGE.to.toISOString(),
      ],
      queryFn: async (): Promise<ClientOverview> => {
        const [shop, ads, creators] = await Promise.all([
          repositories.shop.getDailyMetrics(client.id, RANGE),
          repositories.ads.getDailyMetrics(client.id, RANGE),
          repositories.creators.getCreators(client.id),
        ])
        return { client, shop, ads, creators }
      },
      enabled: clients.length > 0,
    })),
  })

  return {
    isLoading: clientsQuery.isLoading || queries.some((q) => q.isLoading),
    clients: queries.map((q) => ({ data: q.data, isLoading: q.isLoading })),
  }
}
