import { randomUUID } from 'node:crypto'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

import {
  createPermissionRequest,
  type AdapterAvailability,
  type AgentAdapter,
  type AgentPlanInput,
  type ExecutionEvent,
  type PermissionCapability,
  type TaskPlan
} from '@mango/core'

const execFileAsync = promisify(execFile)

interface CommandRunnerInput {
  command: string
  args: string[]
  cwd?: string
}

interface CommandRunnerResult {
  exitCode: number
  stdout: string
  stderr: string
}

interface ExecFileErrorLike extends Error {
  code?: number | string
  stderr?: string | Buffer
  stdout?: string | Buffer
}

interface ClaudeCodeCliAdapterOptions {
  command?: string
  commandRunner?: (input: CommandRunnerInput) => Promise<CommandRunnerResult>
  model?: string
}

interface PlanPayload {
  headline: string
  summary: string
  steps: string[]
  requestedPermissions: Array<{
    capability: PermissionCapability
    reason: string
  }>
}

const defaultCommand = process.env.MANGO_CLAUDE_COMMAND ?? 'claude'

const planSchema = {
  type: 'object',
  additionalProperties: false,
  required: ['headline', 'summary', 'steps', 'requestedPermissions'],
  properties: {
    headline: {
      type: 'string',
      minLength: 1
    },
    summary: {
      type: 'string',
      minLength: 1
    },
    steps: {
      type: 'array',
      minItems: 1,
      items: {
        type: 'string',
        minLength: 1
      }
    },
    requestedPermissions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        required: ['capability', 'reason'],
        properties: {
          capability: {
            type: 'string',
            enum: ['shell', 'filesystem', 'network', 'browser']
          },
          reason: {
            type: 'string',
            minLength: 1
          }
        }
      }
    }
  }
} as const

const timestamp = (offsetMilliseconds = 0): string =>
  new Date(Date.now() + offsetMilliseconds).toISOString()

const createExecutionEventId = (sessionId: string, suffix: string): string =>
  `${sessionId}-${randomUUID()}-${suffix}`

const normalizeText = (value: string): string => value.trim()

const buildCommandErrorMessage = (
  label: string,
  command: string,
  result: CommandRunnerResult
): string => {
  const detail =
    normalizeText(result.stderr) || normalizeText(result.stdout) || 'No output returned.'
  return `${label} command "${command}" failed: ${detail}`
}

const parseJson = <TValue>(value: string, context: string): TValue => {
  try {
    return JSON.parse(value) as TValue
  } catch (error) {
    throw new Error(`Failed to parse ${context}: ${(error as Error).message}`)
  }
}

const normalizePlan = (payload: PlanPayload): TaskPlan => ({
  headline: payload.headline.trim(),
  summary: payload.summary.trim(),
  steps: payload.steps.map((step) => step.trim()).filter((step) => step.length > 0),
  requestedPermissions: payload.requestedPermissions.map((permission) =>
    createPermissionRequest(permission.capability, permission.reason.trim())
  )
})

const defaultCommandRunner = async ({
  command,
  args,
  cwd
}: CommandRunnerInput): Promise<CommandRunnerResult> => {
  try {
    const result = await execFileAsync(command, args, {
      cwd,
      encoding: 'utf8',
      windowsHide: true,
      maxBuffer: 10 * 1024 * 1024
    })

    return {
      exitCode: 0,
      stdout: normalizeText(result.stdout),
      stderr: normalizeText(result.stderr)
    }
  } catch (error) {
    const execError = error as ExecFileErrorLike

    return {
      exitCode: typeof execError.code === 'number' ? execError.code : 1,
      stdout: typeof execError.stdout === 'string' ? normalizeText(execError.stdout) : '',
      stderr:
        typeof execError.stderr === 'string'
          ? normalizeText(execError.stderr)
          : normalizeText(execError.message)
    }
  }
}

const buildPlanPrompt = (input: AgentPlanInput): string =>
  `
你是 Mango 的桌面端执行规划器。请只返回满足 JSON Schema 的对象，不要输出解释文本。

当前任务：
${input.prompt}

工作区：
- 名称：${input.workspace.name}
- 路径：${input.workspace.rootPath}
- Shell：${input.workspace.shell}
- Git 分支：${input.workspace.gitBranch}
- Git 状态：${input.workspace.gitStatusSummary}

请输出：
1. 一个适合桌面 Agent 工作流的标题
2. 一段简洁摘要
3. 3 到 6 个可执行步骤
4. 完成此任务需要的权限请求
`.trim()

const buildExecutionPrompt = (input: AgentPlanInput): string =>
  `
你正在 Mango 的桌面端工作台中执行一个已经获得用户批准的真实任务。

当前任务：
${input.prompt}

工作区：
- 名称：${input.workspace.name}
- 路径：${input.workspace.rootPath}
- Shell：${input.workspace.shell}
- Git 分支：${input.workspace.gitBranch}

请直接执行任务，并在结束时输出一段简洁总结，必须包含：
- 做了什么
- 关键结果
- 如果失败，失败原因与下一步建议
`.trim()

export class ClaudeCodeCliAdapter implements AgentAdapter {
  public readonly id = 'claude-code'
  public readonly label = 'Claude Code CLI'

  private readonly command: string
  private readonly commandRunner: (input: CommandRunnerInput) => Promise<CommandRunnerResult>
  private readonly model: string | undefined

  public constructor(options: ClaudeCodeCliAdapterOptions = {}) {
    this.command = options.command ?? defaultCommand
    this.commandRunner = options.commandRunner ?? defaultCommandRunner
    this.model = options.model
  }

  public async detectAvailability(): Promise<AdapterAvailability> {
    const result = await this.commandRunner({
      command: this.command,
      args: ['--version']
    })

    if (result.exitCode !== 0) {
      return {
        available: false,
        command: this.command,
        details:
          normalizeText(result.stderr) ||
          `${this.label} is unavailable. Install the CLI or pick the mock adapter.`
      }
    }

    return {
      available: true,
      command: this.command,
      details: `${this.label} is available for local Mango execution.`
    }
  }

  public async generatePlan(input: AgentPlanInput): Promise<TaskPlan> {
    const result = await this.commandRunner({
      command: this.command,
      cwd: input.workspace.rootPath,
      args: this.buildCommandArguments([
        '-p',
        buildPlanPrompt(input),
        '--json-schema',
        JSON.stringify(planSchema)
      ])
    })

    if (result.exitCode !== 0) {
      throw new Error(buildCommandErrorMessage(this.label, this.command, result))
    }

    const payload = parseJson<PlanPayload>(result.stdout, `${this.label} plan output`)
    return normalizePlan(payload)
  }

  public async runApprovedPlan(input: AgentPlanInput): Promise<ExecutionEvent[]> {
    const result = await this.commandRunner({
      command: this.command,
      cwd: input.workspace.rootPath,
      args: this.buildCommandArguments([
        '-p',
        buildExecutionPrompt(input),
        '--dangerously-skip-permissions'
      ])
    })

    if (result.exitCode !== 0) {
      throw new Error(buildCommandErrorMessage(this.label, this.command, result))
    }

    const summary = normalizeText(result.stdout) || `${this.label} completed the approved task.`

    return [
      {
        type: 'terminal.output',
        id: createExecutionEventId(input.sessionId, 'claude-output'),
        level: 'info',
        message: `${this.label} completed the approved run`,
        createdAt: timestamp()
      },
      {
        type: 'summary.ready',
        id: createExecutionEventId(input.sessionId, 'claude-summary'),
        level: 'info',
        message: `${this.label} summary ready`,
        summary,
        createdAt: timestamp(1)
      }
    ]
  }

  private buildCommandArguments(baseArguments: string[]): string[] {
    if (!this.model) {
      return baseArguments
    }

    return [...baseArguments, '--model', this.model]
  }
}
