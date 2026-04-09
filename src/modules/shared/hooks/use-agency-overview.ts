import { useQuery } from '@tanstack/react-query'
import { repositories } from '@/data'

export function useAgencyOverview() {
  const heydude = useQuery({
    queryKey: ['agency', 'overview', 'heydude'],
    queryFn: async () => {
      const shop = await repositories.shop.getDailyMetrics('client-1', {
        from: new Date('2025-10-01'),
        to: new Date('2025-10-31'),
      })
      const creators = await repositories.creators.getCreators('client-1')
      const ads = await repositories.ads.getDailyMetrics('client-1', {
        from: new Date('2025-10-01'),
        to: new Date('2025-10-31'),
      })
      return { shop, creators, ads, name: 'HEYDUDE', slug: 'heydude' }
    },
  })

  return { clients: [heydude] }
}
