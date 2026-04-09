import { createMockShopRepository } from './adapters/mock/shop.mock'
import { createMockVideoRepository } from './adapters/mock/video.mock'
import { createMockAdsRepository } from './adapters/mock/ads.mock'
import { createMockAuthRepository } from './adapters/mock/auth.mock'
import { createMockCreatorRepository } from './adapters/mock/creators.mock'
import { createMockContentRepository } from './adapters/mock/content.mock'
import { createMockSamplesRepository } from './adapters/mock/samples.mock'

export const repositories = {
  shop: createMockShopRepository(),
  video: createMockVideoRepository(),
  ads: createMockAdsRepository(),
  auth: createMockAuthRepository(),
  creators: createMockCreatorRepository(),
  content: createMockContentRepository(),
  samples: createMockSamplesRepository(),
}
