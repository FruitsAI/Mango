export type TaskStatus =
  | 'draft'
  | 'planned'
  | 'approved'
  | 'running'
  | 'succeeded'
  | 'failed'
  | 'cancelled'

export type PermissionCapability = 'shell' | 'filesystem' | 'network' | 'browser'
export type PermissionRisk = 'medium' | 'high'

export interface PermissionRequest {
  capability: PermissionCapability
  reason: string
}

export interface PermissionDecision extends PermissionRequest {
  requiresApproval: boolean
  risk: PermissionRisk
  label: string
}

export interface PermissionPolicy {
  id: string
  name: string
  evaluate: (request: PermissionRequest) => PermissionDecision
}

export interface TaskPlan {
  headline: string
  summary: string
  steps: string[]
  requestedPermissions: PermissionRequest[]
}

export interface WorkspaceContext {
  id: string
  name: string
  rootPath: string
  shell: string
  gitBranch: string
  gitStatusSummary: string
  envAllowList: string[]
  recentTaskIds: string[]
  providerConfig?: {
    primaryAdapterId?: string
    configuredAdapters: string[]
  }
}

export interface TaskReview {
  summary: string
  changedFiles: string[]
  totalEvents: number
}

export interface ExecutionEventBase {
  id: string
  level: 'info' | 'warning' | 'error'
  message: string
  createdAt: string
}

export interface TerminalOutputEvent extends ExecutionEventBase {
  type: 'terminal.output'
}

export interface FileChangeEvent extends ExecutionEventBase {
  type: 'file.change'
  filePath: string
}

export interface SummaryReadyEvent extends ExecutionEventBase {
  type: 'summary.ready'
  summary: string
}

export interface ToolCallEvent extends ExecutionEventBase {
  type: 'tool.call'
  toolName: string
}

export type ExecutionEvent =
  | TerminalOutputEvent
  | FileChangeEvent
  | SummaryReadyEvent
  | ToolCallEvent

export interface TaskSession {
  id: string
  adapterId: string
  prompt: string
  status: TaskStatus
  workspace: WorkspaceContext
  plan?: TaskPlan
  events: ExecutionEvent[]
  executionSummary?: string
  approvedBy?: string
  createdAt: string
  updatedAt: string
}

export type TaskTransition =
  | {
      type: 'plan-generated'
      plan: TaskPlan
    }
  | {
      type: 'approved'
      approvedBy: string
    }
  | {
      type: 'execution-started'
    }
  | {
      type: 'execution-finished'
      summary: string
    }
  | {
      type: 'execution-failed'
      summary: string
    }
  | {
      type: 'cancelled'
      summary?: string
    }

export interface AgentPlanInput {
  sessionId: string
  prompt: string
  workspace: WorkspaceContext
}

export interface AdapterAvailability {
  available: boolean
  command?: string
  details: string
}

export interface AgentAdapter {
  id: string
  label: string
  detectAvailability: () => Promise<AdapterAvailability>
  generatePlan: (input: AgentPlanInput) => Promise<TaskPlan>
  runApprovedPlan: (input: AgentPlanInput) => Promise<ExecutionEvent[]>
}
