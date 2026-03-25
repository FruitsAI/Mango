import { describe, expect, it, vi } from 'vitest'

import { createWorkspaceContext } from '@mango/core'

import { ClaudeCodeCliAdapter } from '../src/index'

const workspace = createWorkspaceContext({
  id: 'workspace-main',
  name: 'Mango',
  rootPath: 'D:/willxue/FruitsAI/Mango',
  shell: 'powershell',
  gitBranch: 'codex/mango-v1',
  gitStatusSummary: 'clean'
})

describe('ClaudeCodeCliAdapter', () => {
  it('detects the installed claude command', async () => {
    const commandRunner = vi.fn(async () => ({
      exitCode: 0,
      stdout: '1.0.0',
      stderr: ''
    }))
    const adapter = new ClaudeCodeCliAdapter({
      commandRunner
    })

    const availability = await adapter.detectAvailability()

    expect(availability.available).toBe(true)
    expect(availability.command).toBe('claude')
    expect(commandRunner).toHaveBeenCalledWith(
      expect.objectContaining({
        command: 'claude',
        args: ['--version']
      })
    )
  })

  it('generates a structured task plan through claude json schema output', async () => {
    const commandRunner = vi.fn(async ({ args }: { args: string[] }) => {
      if (args[0] === '--version') {
        return {
          exitCode: 0,
          stdout: '1.0.0',
          stderr: ''
        }
      }

      return {
        exitCode: 0,
        stdout: JSON.stringify({
          headline: 'Implement Mango adapter registry',
          summary: 'Detect the CLI, select the adapter, and persist the choice.',
          steps: [
            'Detect claude availability',
            'Generate the approved plan',
            'Persist the selected adapter'
          ],
          requestedPermissions: [
            {
              capability: 'shell',
              reason: 'Run the Claude Code CLI'
            },
            {
              capability: 'filesystem',
              reason: 'Apply repository changes'
            }
          ]
        }),
        stderr: ''
      }
    })
    const adapter = new ClaudeCodeCliAdapter({
      commandRunner
    })

    const plan = await adapter.generatePlan({
      sessionId: 'session-1',
      prompt: 'Implement adapter registry',
      workspace
    })

    expect(plan.headline).toBe('Implement Mango adapter registry')
    expect(plan.steps).toHaveLength(3)
    expect(plan.requestedPermissions.map((permission) => permission.capability)).toEqual([
      'shell',
      'filesystem'
    ])
    expect(commandRunner).toHaveBeenCalledWith(
      expect.objectContaining({
        command: 'claude',
        cwd: workspace.rootPath,
        args: expect.arrayContaining(['-p', '--json-schema'])
      })
    )
  })

  it('turns claude execution output into Mango execution events', async () => {
    const commandRunner = vi.fn(async () => ({
      exitCode: 0,
      stdout: 'Updated the adapter registry and verified the desktop workflow.',
      stderr: ''
    }))
    const adapter = new ClaudeCodeCliAdapter({
      commandRunner
    })

    const events = await adapter.runApprovedPlan({
      sessionId: 'session-1',
      prompt: 'Implement adapter registry',
      workspace
    })

    expect(events.map((event) => event.type)).toEqual(['terminal.output', 'summary.ready'])
    expect(events[1]).toMatchObject({
      type: 'summary.ready',
      summary: 'Updated the adapter registry and verified the desktop workflow.'
    })
    expect(commandRunner).toHaveBeenCalledWith(
      expect.objectContaining({
        command: 'claude',
        cwd: workspace.rootPath,
        args: expect.arrayContaining(['-p', '--dangerously-skip-permissions'])
      })
    )
  })
})
