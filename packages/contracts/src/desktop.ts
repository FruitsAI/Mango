import type { PermissionDecision, TaskReview, TaskSession, WorkspaceContext } from '@mango/core'

export const MANGO_DESKTOP_CHANNELS = {
  bootstrap: 'mango:bootstrap',
  generatePlan: 'mango:generate-plan',
  approveAndRun: 'mango:approve-and-run',
  openFeedback: 'mango:open-feedback'
} as const

export type MangoDesktopChannel =
  (typeof MANGO_DESKTOP_CHANNELS)[keyof typeof MANGO_DESKTOP_CHANNELS]

export type DesktopApiErrorCode =
  | 'PERMISSION_DENIED'
  | 'WORKSPACE_UNAVAILABLE'
  | 'ADAPTER_UNAVAILABLE'
  | 'TASK_STATE_INVALID'
  | 'UNKNOWN_ERROR'

export interface ContractError {
  code: DesktopApiErrorCode | string
  message: string
  retryable: boolean
  suggestion?: string
}

export interface DesktopSettings {
  telemetryEnabled: boolean
  releaseChannel: 'nightly' | 'beta' | 'stable'
}

export interface DesktopEnvironment {
  platform: string
  shell: string
  autoUpdateConfigured: boolean
}

export interface AdapterStatus {
  id: string
  label: string
  available: boolean
  details: string
}

export interface DesktopState {
  productName: 'Mango'
  slogan: string
  adapters: AdapterStatus[]
  workspaces: WorkspaceContext[]
  selectedWorkspaceId: string
  activeTask: TaskSession | null
  currentPermissions: PermissionDecision[]
  review: TaskReview | null
  history: TaskSession[]
  settings: DesktopSettings
  environment: DesktopEnvironment
}

export interface GeneratePlanInput {
  prompt: string
  workspaceId: string
  adapterId: string
}

export interface DesktopApi {
  bootstrap: () => Promise<DesktopState>
  generatePlan: (input: GeneratePlanInput) => Promise<DesktopState>
  approveAndRun: () => Promise<DesktopState>
  openFeedback: () => Promise<void>
}
