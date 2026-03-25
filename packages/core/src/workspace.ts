import type { WorkspaceContext } from './types'

export interface WorkspaceContextInput {
  id: string
  name: string
  rootPath: string
  shell: string
  gitBranch: string
  gitStatusSummary: string
  envAllowList?: string[]
  recentTaskIds?: string[]
  providerConfig?: WorkspaceContext['providerConfig']
}

export const createWorkspaceContext = (input: WorkspaceContextInput): WorkspaceContext => ({
  ...input,
  envAllowList: input.envAllowList ?? ['PATH', 'HOME', 'USERPROFILE'],
  recentTaskIds: input.recentTaskIds ?? [],
  providerConfig: input.providerConfig ?? {
    configuredAdapters: []
  }
})
