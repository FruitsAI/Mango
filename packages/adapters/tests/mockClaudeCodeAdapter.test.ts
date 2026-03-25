import { describe, expect, it } from 'vitest'

import { createWorkspaceContext } from '@mango/core'

import { MockClaudeCodeAdapter } from '../src/index'

const workspace = createWorkspaceContext({
  id: 'workspace-main',
  name: 'Mango',
  rootPath: 'D:/willxue/FruitsAI/Mango',
  shell: 'powershell',
  gitBranch: 'codex/mango-v1',
  gitStatusSummary: 'clean'
})

describe('MockClaudeCodeAdapter', () => {
  it('generates a developer-focused plan', async () => {
    const adapter = new MockClaudeCodeAdapter()

    const plan = await adapter.generatePlan({
      sessionId: 'session-1',
      prompt: 'Implement release workflow',
      workspace
    })

    expect(plan.headline).toContain('Implement release workflow')
    expect(plan.steps).toHaveLength(4)
    expect(plan.requestedPermissions.map((permission) => permission.capability)).toEqual([
      'shell',
      'filesystem',
      'network'
    ])
  })

  it('streams execution events and a final summary', async () => {
    const adapter = new MockClaudeCodeAdapter()
    const events = await adapter.runApprovedPlan({
      sessionId: 'session-1',
      prompt: 'Implement release workflow',
      workspace
    })

    expect(events.map((event) => event.type)).toContain('summary.ready')
    expect(events.some((event) => event.type === 'file.change')).toBe(true)
  })
})
