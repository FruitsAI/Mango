import { execFileSync } from 'node:child_process'

import { createDefaultAgentAdapters } from '@mango/adapters'
import type { DesktopState, GeneratePlanInput } from '@mango/contracts'
import {
  applyTaskTransition,
  appendExecutionEvent,
  buildTaskReview,
  createDefaultPermissionPolicy,
  createTaskSession,
  createWorkspaceContext,
  evaluatePermissionRequests,
  type AgentAdapter,
  type TaskSession,
  type WorkspaceContext
} from '@mango/core'

import {
  currentDesktopSchemaVersion,
  defaultDesktopSettings,
  type DesktopStateStore,
  type PersistedDesktopState
} from '../persistence/fileDesktopStore'

const countGitChanges = (rootPath: string): string => {
  try {
    const output = execFileSync('git', ['status', '--short'], {
      cwd: rootPath,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim()

    return output.length === 0 ? 'clean' : `${output.split(/\r?\n/).length} files changed`
  } catch {
    return 'git unavailable'
  }
}

const readGitBranch = (rootPath: string): string => {
  try {
    const output = execFileSync('git', ['branch', '--show-current'], {
      cwd: rootPath,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim()

    return output || 'detached'
  } catch {
    return 'no-git-branch'
  }
}

const detectShell = (): string => {
  const shellPath = process.env.ComSpec ?? process.env.SHELL ?? 'shell'
  return shellPath.split(/[\\/]/).pop() ?? shellPath
}

const upsertHistory = (history: TaskSession[], session: TaskSession): TaskSession[] => [
  session,
  ...history.filter((entry) => entry.id !== session.id)
]

const buildFailureEvent = (sessionId: string, message: string) => ({
  type: 'terminal.output' as const,
  id: `${sessionId}-failure-${Date.now().toString(36)}`,
  level: 'error' as const,
  message,
  createdAt: new Date().toISOString()
})

const normalizeErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Unknown adapter failure.'

const upsertWorkspaceAdapter = (
  workspaces: WorkspaceContext[],
  workspaceId: string,
  adapterId: string
): WorkspaceContext[] =>
  workspaces.map((workspace) =>
    workspace.id !== workspaceId
      ? workspace
      : createWorkspaceContext({
          ...workspace,
          providerConfig: {
            primaryAdapterId: adapterId,
            configuredAdapters: Array.from(
              new Set([...(workspace.providerConfig?.configuredAdapters ?? []), adapterId])
            )
          }
        })
  )

export class DesktopController {
  private readonly permissionPolicy = createDefaultPermissionPolicy()

  public constructor(
    private readonly store: DesktopStateStore,
    private readonly adapters: AgentAdapter[] = createDefaultAgentAdapters()
  ) {}

  public async bootstrap(): Promise<DesktopState> {
    const persisted = await this.ensureState()
    return this.buildDesktopState(persisted)
  }

  public async generatePlan(input: GeneratePlanInput): Promise<DesktopState> {
    const persisted = await this.ensureState()
    const baseWorkspace =
      persisted.workspaces.find((entry) => entry.id === input.workspaceId) ??
      persisted.workspaces[0] ??
      this.detectDefaultWorkspace()
    const adapter = await this.requireAdapter(input.adapterId)
    const workspace = createWorkspaceContext({
      ...baseWorkspace,
      providerConfig: {
        primaryAdapterId: adapter.id,
        configuredAdapters: Array.from(
          new Set([...(baseWorkspace.providerConfig?.configuredAdapters ?? []), adapter.id])
        )
      }
    })

    let session = createTaskSession({
      adapterId: adapter.id,
      prompt: input.prompt,
      workspace
    })

    const plan = await adapter.generatePlan({
      sessionId: session.id,
      prompt: session.prompt,
      workspace
    })

    session = applyTaskTransition(session, {
      type: 'plan-generated',
      plan
    })

    const nextState: PersistedDesktopState = {
      ...persisted,
      schemaVersion: currentDesktopSchemaVersion,
      activeTask: session,
      history: upsertHistory(persisted.history, session),
      selectedWorkspaceId: workspace.id,
      workspaces: upsertWorkspaceAdapter(persisted.workspaces, workspace.id, adapter.id)
    }

    await this.store.write(nextState)
    return this.buildDesktopState(nextState)
  }

  public async approveAndRun(): Promise<DesktopState> {
    const persisted = await this.ensureState()
    const activeTask = persisted.activeTask

    if (!activeTask?.plan || !['planned', 'approved'].includes(activeTask.status)) {
      return this.buildDesktopState(persisted)
    }

    let session = activeTask

    if (session.status === 'planned') {
      session = applyTaskTransition(session, {
        type: 'approved',
        approvedBy: 'desktop-user'
      })
    }

    if (session.status === 'approved') {
      session = applyTaskTransition(session, {
        type: 'execution-started'
      })
    }

    try {
      const adapter = await this.requireAdapter(session.adapterId)
      const events = await adapter.runApprovedPlan({
        sessionId: session.id,
        prompt: session.prompt,
        workspace: session.workspace
      })

      for (const event of events) {
        session = appendExecutionEvent(session, event)
      }

      const finalSummary =
        events.find(
          (event): event is Extract<(typeof events)[number], { type: 'summary.ready' }> =>
            event.type === 'summary.ready'
        )?.summary ?? 'Execution completed.'

      session = applyTaskTransition(session, {
        type: 'execution-finished',
        summary: finalSummary
      })
    } catch (error) {
      const failureSummary = `${session.adapterId} failed: ${normalizeErrorMessage(error)}`
      session = appendExecutionEvent(session, buildFailureEvent(session.id, failureSummary))
      session = applyTaskTransition(session, {
        type: 'execution-failed',
        summary: failureSummary
      })
    }

    const nextState: PersistedDesktopState = {
      ...persisted,
      schemaVersion: currentDesktopSchemaVersion,
      activeTask: session,
      history: upsertHistory(persisted.history, session)
    }

    await this.store.write(nextState)
    return this.buildDesktopState(nextState)
  }

  private async ensureState(): Promise<PersistedDesktopState> {
    const persisted = await this.store.read()

    if (persisted) {
      const refreshedWorkspaces = persisted.workspaces.map((workspace) =>
        this.refreshWorkspace(workspace)
      )
      return {
        ...persisted,
        workspaces: refreshedWorkspaces
      }
    }

    const workspace = this.detectDefaultWorkspace()

    const initialState: PersistedDesktopState = {
      schemaVersion: currentDesktopSchemaVersion,
      activeTask: null,
      history: [],
      selectedWorkspaceId: workspace.id,
      settings: defaultDesktopSettings,
      workspaces: [workspace]
    }

    await this.store.write(initialState)

    return initialState
  }

  private detectDefaultWorkspace(): WorkspaceContext {
    const rootPath = process.env.MANGO_WORKSPACE_ROOT ?? process.cwd()

    return createWorkspaceContext({
      id: 'workspace-main',
      name: 'Active workspace',
      rootPath,
      shell: detectShell(),
      gitBranch: readGitBranch(rootPath),
      gitStatusSummary: countGitChanges(rootPath)
    })
  }

  private refreshWorkspace(workspace: WorkspaceContext): WorkspaceContext {
    return createWorkspaceContext({
      ...workspace,
      shell: detectShell(),
      gitBranch: readGitBranch(workspace.rootPath),
      gitStatusSummary: countGitChanges(workspace.rootPath)
    })
  }

  private async buildDesktopState(persisted: PersistedDesktopState): Promise<DesktopState> {
    const adapterStatuses = await Promise.all(
      this.adapters.map(async (adapter) => {
        try {
          const availability = await adapter.detectAvailability()

          return {
            id: adapter.id,
            label: adapter.label,
            available: availability.available,
            details: availability.details
          }
        } catch (error) {
          return {
            id: adapter.id,
            label: adapter.label,
            available: false,
            details: normalizeErrorMessage(error)
          }
        }
      })
    )
    const activeTask = persisted.activeTask
    const currentPermissions = activeTask?.plan
      ? evaluatePermissionRequests(this.permissionPolicy, activeTask.plan.requestedPermissions)
      : []
    const selectedWorkspaceId =
      persisted.selectedWorkspaceId ??
      persisted.workspaces[0]?.id ??
      this.detectDefaultWorkspace().id

    return {
      productName: 'Mango',
      slogan: 'You Plan, Mango Goes.',
      adapters: adapterStatuses,
      workspaces: persisted.workspaces,
      selectedWorkspaceId,
      activeTask,
      currentPermissions,
      review: activeTask ? buildTaskReview(activeTask) : null,
      history: persisted.history,
      settings: persisted.settings,
      environment: {
        platform: process.platform,
        shell: detectShell(),
        autoUpdateConfigured: true
      }
    }
  }

  private async requireAdapter(adapterId: string): Promise<AgentAdapter> {
    const adapter = this.adapters.find((entry) => entry.id === adapterId)

    if (!adapter) {
      throw new Error(`Adapter "${adapterId}" is not registered.`)
    }

    const availability = await adapter.detectAvailability()

    if (!availability.available) {
      throw new Error(availability.details)
    }

    return adapter
  }
}
