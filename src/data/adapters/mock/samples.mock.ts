import type { SamplesRepository } from '@/data/repositories/types'
import samplesData from '@/data/fixtures/samples.json'
import type { Product, SampleOrder, HeroProduct, Restock } from '@/modules/samples/types'

export function createMockSamplesRepository(): SamplesRepository {
  return {
    async getProducts(_clientId: string): Promise<Product[]> {
      return samplesData.products as Product[]
    },
    async getSampleOrders(_clientId: string): Promise<SampleOrder[]> {
      return samplesData.sampleOrders as SampleOrder[]
    },
    async getHeroProducts(_clientId: string): Promise<HeroProduct[]> {
      return samplesData.heroProducts as HeroProduct[]
    },
    async getRestocks(_clientId: string): Promise<Restock[]> {
      return samplesData.restocks as Restock[]
    },
  }
}
