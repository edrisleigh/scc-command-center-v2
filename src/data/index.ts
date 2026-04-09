import { createMockShopRepository } from './adapters/mock/shop.mock'
import { createMockVideoRepository } from './adapters/mock/video.mock'
import { createMockAdsRepository } from './adapters/mock/ads.mock'
import { createMockAuthRepository } from './adapters/mock/auth.mock'

export const repositories = {
  shop: createMockShopRepository(),
  video: createMockVideoRepository(),
  ads: createMockAdsRepository(),
  auth: createMockAuthRepository(),
}
