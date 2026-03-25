import { render, screen } from '@testing-library/react'

import { createWorkspaceContext } from '@mango/core'

import { buildMockDesktopState } from '../app/fixtures'
import { TaskWorkbench } from '../features/task-workbench/TaskWorkbench'

describe('TaskWorkbench', () => {
  it('renders the Mango execution loop and status rails', () => {
    render(
      <TaskWorkbench
        state={buildMockDesktopState({
          workspaces: [
            createWorkspaceContext({
              id: 'workspace-main',
              name: 'Mango',
              rootPath: 'D:/willxue/FruitsAI/Mango',
              shell: 'powershell',
              gitBranch: 'codex/mango-v1',
              gitStatusSummary: '2 files changed'
            })
          ]
        })}
      />
    )

    expect(
      screen.getByRole('heading', {
        name: 'You Plan, Mango Goes.'
      })
    ).toBeInTheDocument()
    expect(screen.getAllByText('Plan').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Approve').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Go').length).toBeGreaterThan(0)
    expect(screen.getAllByText('Review').length).toBeGreaterThan(0)
    expect(screen.getAllByText(/mock claude cli/i).length).toBeGreaterThan(0)
  })

  it('renders the selected adapter control and adapter availability details', () => {
    render(
      <TaskWorkbench
        selectedAdapterId="claude-code"
        state={buildMockDesktopState({
          adapters: [
            {
              id: 'claude-code',
              label: 'Claude Code CLI',
              available: true,
              details: 'Claude Code CLI is available for local Mango execution.'
            },
            {
              id: 'mock-claude',
              label: 'Mock Claude CLI',
              available: true,
              details: 'Local bundled adapter for rapid product iteration.'
            }
          ],
          workspaces: [
            createWorkspaceContext({
              id: 'workspace-main',
              name: 'Mango',
              rootPath: 'D:/willxue/FruitsAI/Mango',
              shell: 'powershell',
              gitBranch: 'codex/mango-v1',
              gitStatusSummary: 'clean',
              providerConfig: {
                primaryAdapterId: 'claude-code',
                configuredAdapters: ['claude-code', 'mock-claude']
              }
            })
          ]
        })}
      />
    )

    expect(screen.getByRole('combobox', { name: /execution adapter/i })).toHaveValue('claude-code')
    expect(
      screen.getByText('Claude Code CLI is available for local Mango execution.')
    ).toBeInTheDocument()
  })
})
