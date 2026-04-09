import { createMockShopRepository } from './adapters/mock/shop.mock'
import { createMockVideoRepository } from './adapters/mock/video.mock'
import { createMockAdsRepository } from './adapters/mock/ads.mock'
import { createMockAuthRepository } from './adapters/mock/auth.mock'
import { createMockCreatorRepository } from './adapters/mock/creators.mock'
import { createMockContentRepository } from './adapters/mock/content.mock'
import { createMockSamplesRepository } from './adapters/mock/samples.mock'
import { createMockScorecardsRepository } from './adapters/mock/scorecards.mock'
import { createMockPlanningRepository } from './adapters/mock/planning.mock'
import { createMockCalendarRepository } from './adapters/mock/calendar.mock'
import { createMockWorkflowRepository } from './adapters/mock/workflow.mock'

export const repositories = {
  shop: createMockShopRepository(),
  video: createMockVideoRepository(),
  ads: createMockAdsRepository(),
  auth: createMockAuthRepository(),
  creators: createMockCreatorRepository(),
  content: createMockContentRepository(),
  samples: createMockSamplesRepository(),
  scorecards: createMockScorecardsRepository(),
  planning: createMockPlanningRepository(),
  calendar: createMockCalendarRepository(),
  workflow: createMockWorkflowRepository(),
}
