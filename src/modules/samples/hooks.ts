import { useQuery } from '@tanstack/react-query'
import { repositories } from '@/data'

export function useProducts(clientId: string) {
  return useQuery({
    queryKey: ['samples', 'products', clientId],
    queryFn: () => repositories.samples.getProducts(clientId),
  })
}

export function useSampleOrders(clientId: string) {
  return useQuery({
    queryKey: ['samples', 'orders', clientId],
    queryFn: () => repositories.samples.getSampleOrders(clientId),
  })
}

export function useHeroProducts(clientId: string) {
  return useQuery({
    queryKey: ['samples', 'hero', clientId],
    queryFn: () => repositories.samples.getHeroProducts(clientId),
  })
}

export function useRestocks(clientId: string) {
  return useQuery({
    queryKey: ['samples', 'restocks', clientId],
    queryFn: () => repositories.samples.getRestocks(clientId),
  })
}
