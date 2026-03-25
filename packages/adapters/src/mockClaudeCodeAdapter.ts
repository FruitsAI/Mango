import {
  createPermissionRequest,
  type AgentAdapter,
  type AgentPlanInput,
  type ExecutionEvent
} from '@mango/core'

const timestamp = (offsetMinutes = 0): string =>
  new Date(Date.now() + offsetMinutes * 60_000).toISOString()

export class MockClaudeCodeAdapter implements AgentAdapter {
  public readonly id = 'mock-claude'
  public readonly label = 'Mock Claude CLI'

  public async detectAvailability() {
    return {
      available: true,
      command: 'claude',
      details: 'Mock adapter is bundled for local Mango development.'
    }
  }

  public async generatePlan(input: AgentPlanInput) {
    return {
      headline: `Plan for: ${input.prompt}`,
      summary:
        'Inspect the workspace, write an implementation plan, execute the approved batch, then summarize the result.',
      steps: [
        'Inspect the current repository state',
        'Draft a concrete implementation plan',
        'Execute the approved batch with visible permissions',
        'Review the changes and summarize the outcome'
      ],
      requestedPermissions: [
        createPermissionRequest('shell', 'Run checks and local commands'),
        createPermissionRequest('filesystem', 'Create and update project files'),
        createPermissionRequest('network', 'Reach package registries or release metadata if needed')
      ]
    }
  }

  public async runApprovedPlan(input: AgentPlanInput): Promise<ExecutionEvent[]> {
    return [
      {
        type: 'terminal.output',
        id: `${input.sessionId}-evt-1`,
        level: 'info',
        message: `Scanning workspace ${input.workspace.rootPath}`,
        createdAt: timestamp()
      },
      {
        type: 'tool.call',
        id: `${input.sessionId}-evt-2`,
        level: 'info',
        message: 'Drafted implementation steps',
        createdAt: timestamp(1),
        toolName: 'plan-engine'
      },
      {
        type: 'file.change',
        id: `${input.sessionId}-evt-3`,
        level: 'info',
        message: 'Updated launch checklist',
        createdAt: timestamp(2),
        filePath: 'docs/launch/checklist.md'
      },
      {
        type: 'summary.ready',
        id: `${input.sessionId}-evt-4`,
        level: 'info',
        message: 'Execution summary ready',
        createdAt: timestamp(3),
        summary: `Completed the approved task: ${input.prompt}`
      }
    ]
  }
}
