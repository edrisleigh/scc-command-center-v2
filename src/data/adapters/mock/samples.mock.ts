import type { SamplesRepository } from '@/data/repositories/types'
import samplesData from '@/data/fixtures/samples.json'
import type { Product, SampleOrder, HeroProduct, Restock } from '@/modules/samples/types'

export function createMockSamplesRepository(): SamplesRepository {
  return {
    async getProducts(clientId: string): Promise<Product[]> {
      return (samplesData.products as Product[]).filter((p) => p.clientId === clientId)
    },
    async getSampleOrders(clientId: string): Promise<SampleOrder[]> {
      return (samplesData.sampleOrders as SampleOrder[]).filter(
        (o) => o.clientId === clientId,
      )
    },
    async getHeroProducts(clientId: string): Promise<HeroProduct[]> {
      return (samplesData.heroProducts as HeroProduct[]).filter(
        (h) => h.clientId === clientId,
      )
    },
    async getRestocks(clientId: string): Promise<Restock[]> {
      return (samplesData.restocks as Restock[]).filter((r) => r.clientId === clientId)
    },
  }
}
