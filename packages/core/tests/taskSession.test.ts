import { describe, expect, it } from 'vitest'

import {
  applyTaskTransition,
  appendExecutionEvent,
  buildTaskReview,
  createTaskSession,
  createWorkspaceContext,
  type ExecutionEvent
} from '../src/index'

const workspace = createWorkspaceContext({
  id: 'workspace-main',
  name: 'Mango',
  rootPath: 'D:/willxue/FruitsAI/Mango',
  shell: 'powershell',
  gitBranch: 'main',
  gitStatusSummary: 'clean'
})

describe('task session lifecycle', () => {
  it('moves through plan approve run review states', () => {
    let session = createTaskSession({
      adapterId: 'mock-claude',
      prompt: 'Ship onboarding',
      workspace
    })

    expect(session.status).toBe('draft')

    session = applyTaskTransition(session, {
      type: 'plan-generated',
      plan: {
        headline: 'Ship onboarding',
        summary: 'Inspect the repo, draft the implementation plan, then execute the first batch.',
        steps: ['Inspect current workspace', 'Draft plan', 'Execute first task'],
        requestedPermissions: [
          {
            capability: 'shell',
            reason: 'Run project checks'
          },
          {
            capability: 'filesystem',
            reason: 'Create docs and source files'
          }
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

    const events: ExecutionEvent[] = [
      {
        type: 'terminal.output',
        id: 'evt-1',
        level: 'info',
        message: 'Running npm test',
        createdAt: '2026-03-23T10:00:00.000Z'
      },
      {
        type: 'file.change',
        id: 'evt-2',
        level: 'info',
        message: 'Created packages/core/src/taskSession.ts',
        createdAt: '2026-03-23T10:01:00.000Z',
        filePath: 'packages/core/src/taskSession.ts'
      }
    ]

    for (const event of events) {
      session = appendExecutionEvent(session, event)
    }

    session = applyTaskTransition(session, {
      type: 'execution-finished',
      summary: 'Onboarding flow shipped.'
    })

    expect(session.status).toBe('succeeded')

    const review = buildTaskReview(session)

    expect(review.summary).toContain('Onboarding flow shipped.')
    expect(review.changedFiles).toEqual(['packages/core/src/taskSession.ts'])
    expect(review.totalEvents).toBe(2)
  })

  it('rejects invalid status transitions', () => {
    const session = createTaskSession({
      adapterId: 'mock-claude',
      prompt: 'Skip planning',
      workspace
    })

    expect(() =>
      applyTaskTransition(session, {
        type: 'execution-started'
      })
    ).toThrowError(/draft to running/i)
  })
})
