export const MONTHS = 6 as const

export const AGENCY_COMMISSION_PCT  = 0.05
export const AGENCY_RETAINER_TTS    = 11_900
export const AGENCY_RETAINER_DTC    = 5_000
export const CREATOR_INCENTIVES     = 5_000
export const VIEWS_PER_VIDEO        = 4_993
export const CLICKS_PER_VIDEO       = 330
export const CREATOR_RETENTION_RATE = 0.98

export const SCENARIO_KEYS = ['conservative', 'balanced', 'aggressive', 'rapid_scale'] as const

export const SCENARIO_LABELS: Record<typeof SCENARIO_KEYS[number], string> = {
  conservative: 'Conservative',
  balanced: 'Balanced',
  aggressive: 'Aggressive',
  rapid_scale: 'Rapid Scale',
}
