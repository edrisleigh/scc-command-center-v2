import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { repositories } from '@/data'
import type { LaunchScenario, ScenarioKey } from './types'

const KEY = {
  list: (orgSlug: string) => ['launch', 'list', orgSlug] as const,
  byId: (scenarioId: string) => ['launch', 'byId', scenarioId] as const,
  byClient: (orgSlug: string, clientSlug: string) =>
    ['launch', 'byClient', orgSlug, clientSlug] as const,
}

export function useLaunchScenarios(orgSlug: string) {
  return useQuery({
    queryKey: KEY.list(orgSlug),
    queryFn: () => repositories.launch.list(orgSlug),
  })
}

export function useLaunchScenario(scenarioId: string) {
  return useQuery({
    queryKey: KEY.byId(scenarioId),
    queryFn: () => repositories.launch.getById(scenarioId),
  })
}

export function useLaunchScenarioByClient(orgSlug: string, clientSlug: string) {
  return useQuery({
    queryKey: KEY.byClient(orgSlug, clientSlug),
    queryFn: () => repositories.launch.getByClientSlug(orgSlug, clientSlug),
  })
}

export function useCreateLaunchScenario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: { orgSlug: string; prospectName: string; name: string }) =>
      repositories.launch.create(input),
    onSuccess: (created) => {
      qc.invalidateQueries({ queryKey: KEY.list(created.orgSlug) })
    },
  })
}

export function useSaveLaunchScenario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (s: LaunchScenario) => repositories.launch.save(s),
    onSuccess: (saved) => {
      qc.setQueryData(KEY.byId(saved.id), saved)
      qc.invalidateQueries({ queryKey: KEY.list(saved.orgSlug) })
    },
  })
}

export function useLockLaunchScenario() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, chosen }: { id: string; chosen: ScenarioKey }) =>
      repositories.launch.lock(id, chosen),
    onSuccess: (locked) => {
      qc.setQueryData(KEY.byId(locked.id), locked)
      qc.invalidateQueries({ queryKey: KEY.list(locked.orgSlug) })
    },
  })
}

export function useLinkLaunchScenarioToClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, clientSlug }: { id: string; clientSlug: string }) =>
      repositories.launch.linkToClient(id, clientSlug),
    onSuccess: (linked) => {
      qc.setQueryData(KEY.byId(linked.id), linked)
      qc.invalidateQueries({ queryKey: KEY.list(linked.orgSlug) })
    },
  })
}
