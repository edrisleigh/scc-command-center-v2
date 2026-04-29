import type { CreatorRepository } from '@/data/repositories/types'
import creatorsData from '@/data/fixtures/creators.json'
import type {
  Creator,
  LiveCreator,
  TargetCollab,
  CollaborationData,
  CreatorIncentive,
} from '@/modules/creators/types'

export function createMockCreatorRepository(): CreatorRepository {
  return {
    async getCreators(clientId: string): Promise<Creator[]> {
      return (creatorsData.creators as Creator[]).filter((c) => c.clientId === clientId)
    },
    async getCreatorById(clientId: string, creatorId: string): Promise<Creator | null> {
      return (
        (creatorsData.creators as Creator[]).find(
          (c) => c.id === creatorId && c.clientId === clientId,
        ) ?? null
      )
    },
    async getLiveCreators(clientId: string): Promise<LiveCreator[]> {
      return (creatorsData.liveCreators as LiveCreator[]).filter(
        (c) => c.clientId === clientId,
      )
    },
    async getTargetCollabs(clientId: string): Promise<TargetCollab[]> {
      return (creatorsData.targetCollabs as TargetCollab[]).filter(
        (c) => c.clientId === clientId,
      )
    },
    async getCollaborationData(clientId: string): Promise<CollaborationData[]> {
      return (creatorsData.collaborationData as CollaborationData[]).filter(
        (c) => c.clientId === clientId,
      )
    },
    async getCreatorIncentives(clientId: string): Promise<CreatorIncentive[]> {
      return (creatorsData.creatorIncentives as CreatorIncentive[]).filter(
        (c) => c.clientId === clientId,
      )
    },
  }
}
