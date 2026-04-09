import type { CreatorRepository } from '@/data/repositories/types'
import creatorsData from '@/data/fixtures/creators.json'
import type { Creator, LiveCreator, TargetCollab, CollaborationData, CreatorIncentive } from '@/modules/creators/types'

export function createMockCreatorRepository(): CreatorRepository {
  return {
    async getCreators(_clientId: string): Promise<Creator[]> {
      return creatorsData.creators as Creator[]
    },
    async getCreatorById(_clientId: string, creatorId: string): Promise<Creator | null> {
      return (creatorsData.creators as Creator[]).find(c => c.id === creatorId) ?? null
    },
    async getLiveCreators(_clientId: string): Promise<LiveCreator[]> {
      return creatorsData.liveCreators as LiveCreator[]
    },
    async getTargetCollabs(_clientId: string): Promise<TargetCollab[]> {
      return creatorsData.targetCollabs as TargetCollab[]
    },
    async getCollaborationData(_clientId: string): Promise<CollaborationData[]> {
      return creatorsData.collaborationData as CollaborationData[]
    },
    async getCreatorIncentives(_clientId: string): Promise<CreatorIncentive[]> {
      return creatorsData.creatorIncentives as CreatorIncentive[]
    },
  }
}
