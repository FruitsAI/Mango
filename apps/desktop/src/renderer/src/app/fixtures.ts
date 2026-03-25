import type { DesktopState } from '@mango/contracts'
import {
  applyTaskTransition,
  appendExecutionEvent,
  buildTaskReview,
  createDefaultPermissionPolicy,
  createPermissionRequest,
  createTaskSession,
  createWorkspaceContext,
  evaluatePermissionRequests,
  type TaskSession,
  type WorkspaceContext
} from '@mango/core'

interface MockDesktopStateOptions {
  adapters?: DesktopState['adapters']
  workspaces?: WorkspaceContext[]
}

const buildPlannedTask = (workspace: WorkspaceContext): TaskSession => {
  let session = createTaskSession({
    adapterId: 'mock-claude',
    prompt:
      'Map the current repository, propose the first implementation batch, and execute it safely.',
    workspace
  })

  session = applyTaskTransition(session, {
    type: 'plan-generated',
    plan: {
      headline: 'Initial Mango bootstrap',
      summary: 'Create the core packages, wire the desktop shell, and prepare release foundations.',
      steps: [
        'Inspect the repository state',
        'Draft the first implementation batch',
        'Request approval for filesystem, shell, and network access',
        'Execute the approved plan and summarize the results'
      ],
      requestedPermissions: [
        createPermissionRequest('shell', 'Run local verification commands'),
        createPermissionRequest('filesystem', 'Create the Mango monorepo'),
        createPermissionRequest('network', 'Fetch package metadata and release assets')
      ]
    }
  })

  session = applyTaskTransition(session, {
    type: 'approved',
    approvedBy: 'will'
  })

  session = applyTaskTransition(session, {
    type: 'execution-started'
  })

  session = appendExecutionEvent(session, {
    type: 'terminal.output',
    id: 'fixture-output',
    level: 'info',
    message: 'pnpm verify',
    createdAt: '2026-03-23T10:00:00.000Z'
  })

  session = appendExecutionEvent(session, {
    type: 'file.change',
    id: 'fixture-file',
    level: 'info',
    message: 'Created apps/desktop/src/main/app/bootstrapDesktopApp.ts',
    createdAt: '2026-03-23T10:01:00.000Z',
    filePath: 'apps/desktop/src/main/app/bootstrapDesktopApp.ts'
  })

  session = appendExecutionEvent(session, {
    type: 'summary.ready',
    id: 'fixture-summary',
    level: 'info',
    message: 'Execution summary ready',
    createdAt: '2026-03-23T10:02:00.000Z',
    summary:
      'Mango generated the plan, executed the first batch, and prepared the release checklist.'
  })

  session = applyTaskTransition(session, {
    type: 'execution-finished',
    summary:
      'Mango generated the plan, executed the first batch, and prepared the release checklist.'
  })

  return session
}

export const buildMockDesktopState = (options: MockDesktopStateOptions = {}): DesktopState => {
  const workspace =
    options.workspaces?.[0] ??
    createWorkspaceContext({
      id: 'workspace-main',
      name: 'Mango',
      rootPath: 'D:/willxue/FruitsAI/Mango',
      shell: 'powershell',
      gitBranch: 'codex/mango-v1',
      gitStatusSummary: 'clean'
    })

  const task = buildPlannedTask(workspace)
  const review = buildTaskReview(task)

  return {
    productName: 'Mango',
    slogan: 'You Plan, Mango Goes.',
    adapters: options.adapters ?? [
      {
        id: 'mock-claude',
        label: 'Mock Claude CLI',
        available: true,
        details: 'Local bundled adapter for rapid product iteration.'
      }
    ],
    workspaces: options.workspaces ?? [workspace],
    selectedWorkspaceId: workspace.id,
    activeTask: task,
    currentPermissions: evaluatePermissionRequests(createDefaultPermissionPolicy(), [
      createPermissionRequest('shell', 'Run project checks'),
      createPermissionRequest('filesystem', 'Create the first Mango source files'),
      createPermissionRequest('network', 'Reach package and release metadata')
    ]),
    review,
    history: [task],
    settings: {
      telemetryEnabled: true,
      releaseChannel: 'beta'
    },
    environment: {
      platform: 'win32',
      shell: workspace.shell,
      autoUpdateConfigured: true
    }
  }
}
