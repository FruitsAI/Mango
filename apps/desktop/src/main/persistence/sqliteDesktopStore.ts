import { readFileSync } from 'node:fs'

import type { DesktopSettings } from '@mango/contracts'
import type { ExecutionEvent, TaskSession, WorkspaceContext } from '@mango/core'
import Database from 'better-sqlite3'

import {
  currentDesktopSchemaVersion,
  defaultDesktopSettings,
  type FileDesktopStore,
  type PersistedDesktopState
} from './fileDesktopStore'
import { desktopSqliteMigrations } from './sqliteMigrationCatalog'

interface StatementSyncLike {
  all: (...parameters: unknown[]) => Record<string, unknown>[]
  get: (...parameters: unknown[]) => Record<string, unknown> | undefined
  run: (...parameters: unknown[]) => unknown
}

interface DatabaseSyncInstance {
  close: () => void
  exec: (sql: string) => void
  prepare: (sql: string) => StatementSyncLike
}

interface WorkspaceRow {
  id: string
  name: string
  rootPath: string
  shell: string
  gitBranch: string
  gitStatusSummary: string
  envAllowListJson: string
  recentTaskIdsJson: string
  providerConfigJson: string
}

interface TaskSessionRow {
  id: string
  workspaceId: string
  adapterId: string
  prompt: string
  status: TaskSession['status']
  approvedBy: string | null
  planJson: string | null
  executionSummary: string | null
  createdAt: string
  updatedAt: string
}

interface ExecutionEventRow {
  id: string
  taskSessionId: string
  type: ExecutionEvent['type']
  level: ExecutionEvent['level']
  message: string
  payloadJson: string | null
  createdAt: string
}

interface DesktopSettingsRow {
  id: string
  schemaVersion: number
  selectedWorkspaceId: string
  telemetryEnabled: number
  releaseChannel: DesktopSettings['releaseChannel']
  activeTaskId: string | null
}

const desktopSettingsRecordId = 'desktop-state'
const now = (): string => new Date().toISOString()

const parseJson = <TValue>(value: string | null, fallback: TValue): TValue => {
  if (value === null) {
    return fallback
  }

  try {
    return JSON.parse(value) as TValue
  } catch {
    return fallback
  }
}

const serializeExecutionEventPayload = (event: ExecutionEvent): string | null => {
  switch (event.type) {
    case 'terminal.output':
      return null
    case 'file.change':
      return JSON.stringify({ filePath: event.filePath })
    case 'summary.ready':
      return JSON.stringify({ summary: event.summary })
    case 'tool.call':
      return JSON.stringify({ toolName: event.toolName })
  }
}

const deserializeExecutionEvent = (row: ExecutionEventRow): ExecutionEvent => {
  const payload = parseJson<Record<string, string>>(row.payloadJson, {})

  switch (row.type) {
    case 'terminal.output':
      return {
        id: row.id,
        type: 'terminal.output',
        level: row.level,
        message: row.message,
        createdAt: row.createdAt
      }
    case 'file.change':
      return {
        id: row.id,
        type: 'file.change',
        level: row.level,
        message: row.message,
        createdAt: row.createdAt,
        filePath: payload.filePath ?? ''
      }
    case 'summary.ready':
      return {
        id: row.id,
        type: 'summary.ready',
        level: row.level,
        message: row.message,
        createdAt: row.createdAt,
        summary: payload.summary ?? ''
      }
    case 'tool.call':
      return {
        id: row.id,
        type: 'tool.call',
        level: row.level,
        message: row.message,
        createdAt: row.createdAt,
        toolName: payload.toolName ?? ''
      }
  }
}

const uniqueTaskSessions = (state: PersistedDesktopState): TaskSession[] => {
  const sessions = new Map<string, TaskSession>()

  for (const session of state.history) {
    sessions.set(session.id, session)
  }

  if (state.activeTask) {
    sessions.set(state.activeTask.id, state.activeTask)
  }

  return Array.from(sessions.values())
}

const fallbackWorkspace = (workspaceId: string): WorkspaceContext => ({
  id: workspaceId,
  name: workspaceId,
  rootPath: '',
  shell: 'shell',
  gitBranch: 'unknown',
  gitStatusSummary: 'unknown',
  envAllowList: ['PATH'],
  recentTaskIds: [],
  providerConfig: {
    configuredAdapters: []
  }
})

export class SQLiteDesktopStore {
  private database: DatabaseSyncInstance | null = null
  private initialized = false

  public constructor(
    private readonly databasePath: string,
    private readonly legacyStore?: Pick<FileDesktopStore, 'read'>
  ) {}

  public close(): void {
    if (this.database) {
      this.database.close()
      this.database = null
    }

    this.initialized = false
  }

  public async read(): Promise<PersistedDesktopState | null> {
    this.ensureInitialized()

    const settingsRow = this.getDatabase()
      .prepare(
        `
        SELECT
          id,
          schema_version AS schemaVersion,
          selected_workspace_id AS selectedWorkspaceId,
          telemetry_enabled AS telemetryEnabled,
          release_channel AS releaseChannel,
          active_task_id AS activeTaskId
        FROM desktop_settings
        WHERE id = ?
      `
      )
      .get(desktopSettingsRecordId) as DesktopSettingsRow | undefined

    if (!settingsRow) {
      const legacyState = this.legacyStore ? await this.legacyStore.read() : null

      if (!legacyState) {
        return null
      }

      await this.write(legacyState)
      return this.read()
    }

    return this.readPersistedState(settingsRow)
  }

  public async write(state: PersistedDesktopState): Promise<void> {
    this.ensureInitialized()

    if (state.workspaces.length === 0) {
      throw new Error('SQLiteDesktopStore requires at least one workspace.')
    }

    const database = this.getDatabase()
    const timestamp = now()
    const sessions = uniqueTaskSessions(state)

    database.exec('BEGIN IMMEDIATE;')

    try {
      database.exec(`
        DELETE FROM execution_events;
        DELETE FROM desktop_settings;
        DELETE FROM task_sessions;
        DELETE FROM workspaces;
      `)

      const insertWorkspace = database.prepare(`
        INSERT INTO workspaces (
          id,
          name,
          root_path,
          shell,
          git_branch,
          git_status_summary,
          env_allow_list_json,
          recent_task_ids_json,
          provider_config_json,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      for (const workspace of state.workspaces) {
        insertWorkspace.run(
          workspace.id,
          workspace.name,
          workspace.rootPath,
          workspace.shell,
          workspace.gitBranch,
          workspace.gitStatusSummary,
          JSON.stringify(workspace.envAllowList),
          JSON.stringify(workspace.recentTaskIds),
          JSON.stringify(workspace.providerConfig ?? { configuredAdapters: [] }),
          timestamp,
          timestamp
        )
      }

      const insertTaskSession = database.prepare(`
        INSERT INTO task_sessions (
          id,
          workspace_id,
          adapter_id,
          prompt,
          status,
          approved_by,
          plan_json,
          execution_summary,
          created_at,
          updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `)

      const insertExecutionEvent = database.prepare(`
        INSERT INTO execution_events (
          id,
          task_session_id,
          type,
          level,
          message,
          payload_json,
          created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `)

      for (const session of sessions) {
        insertTaskSession.run(
          session.id,
          session.workspace.id,
          session.adapterId,
          session.prompt,
          session.status,
          session.approvedBy ?? null,
          session.plan ? JSON.stringify(session.plan) : null,
          session.executionSummary ?? null,
          session.createdAt,
          session.updatedAt
        )

        for (const event of session.events) {
          insertExecutionEvent.run(
            event.id,
            session.id,
            event.type,
            event.level,
            event.message,
            serializeExecutionEventPayload(event),
            event.createdAt
          )
        }
      }

      database
        .prepare(
          `
          INSERT INTO desktop_settings (
            id,
            schema_version,
            selected_workspace_id,
            telemetry_enabled,
            release_channel,
            active_task_id,
            created_at,
            updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `
        )
        .run(
          desktopSettingsRecordId,
          currentDesktopSchemaVersion,
          state.selectedWorkspaceId,
          state.settings.telemetryEnabled ? 1 : 0,
          state.settings.releaseChannel,
          state.activeTask?.id ?? null,
          timestamp,
          timestamp
        )

      database.exec('COMMIT;')
    } catch (error) {
      database.exec('ROLLBACK;')
      throw error
    }
  }

  private ensureInitialized(): void {
    if (this.initialized) {
      return
    }

    const database = this.getDatabase()
    const currentVersionRow = database.prepare('PRAGMA user_version').get() as Record<
      string,
      unknown
    >
    const currentVersionValue = currentVersionRow?.['user_version']
    const currentVersion = typeof currentVersionValue === 'number' ? currentVersionValue : 0

    for (const migration of desktopSqliteMigrations) {
      if (migration.version <= currentVersion) {
        continue
      }

      database.exec(readFileSync(migration.upFilePath, 'utf8'))
      database.exec(`PRAGMA user_version = ${migration.version};`)
    }

    this.initialized = true
  }

  private getDatabase(): DatabaseSyncInstance {
    if (!this.database) {
      const database = new Database(this.databasePath) as DatabaseSyncInstance
      database.exec('PRAGMA foreign_keys = ON;')
      this.database = database
    }

    return this.database
  }

  private readPersistedState(settingsRow: DesktopSettingsRow): PersistedDesktopState {
    const database = this.getDatabase()
    const workspaces = database
      .prepare(
        `
        SELECT
          id,
          name,
          root_path AS rootPath,
          shell,
          git_branch AS gitBranch,
          git_status_summary AS gitStatusSummary,
          env_allow_list_json AS envAllowListJson,
          recent_task_ids_json AS recentTaskIdsJson,
          provider_config_json AS providerConfigJson
        FROM workspaces
        ORDER BY rowid ASC
      `
      )
      .all() as unknown as WorkspaceRow[]
    const workspaceById = new Map<string, WorkspaceContext>()

    for (const row of workspaces) {
      workspaceById.set(row.id, {
        id: row.id,
        name: row.name,
        rootPath: row.rootPath,
        shell: row.shell,
        gitBranch: row.gitBranch,
        gitStatusSummary: row.gitStatusSummary,
        envAllowList: parseJson<string[]>(row.envAllowListJson, ['PATH']),
        recentTaskIds: parseJson<string[]>(row.recentTaskIdsJson, []),
        providerConfig: parseJson<NonNullable<WorkspaceContext['providerConfig']>>(
          row.providerConfigJson,
          { configuredAdapters: [] }
        )
      })
    }

    const eventRows = database
      .prepare(
        `
        SELECT
          id,
          task_session_id AS taskSessionId,
          type,
          level,
          message,
          payload_json AS payloadJson,
          created_at AS createdAt
        FROM execution_events
        ORDER BY created_at ASC, rowid ASC
      `
      )
      .all() as unknown as ExecutionEventRow[]
    const eventsByTaskSessionId = new Map<string, ExecutionEvent[]>()

    for (const row of eventRows) {
      const events = eventsByTaskSessionId.get(row.taskSessionId) ?? []
      events.push(deserializeExecutionEvent(row))
      eventsByTaskSessionId.set(row.taskSessionId, events)
    }

    const taskSessionRows = database
      .prepare(
        `
        SELECT
          id,
          workspace_id AS workspaceId,
          adapter_id AS adapterId,
          prompt,
          status,
          approved_by AS approvedBy,
          plan_json AS planJson,
          execution_summary AS executionSummary,
          created_at AS createdAt,
          updated_at AS updatedAt
        FROM task_sessions
        ORDER BY updated_at DESC, rowid DESC
      `
      )
      .all() as unknown as TaskSessionRow[]
    const history: TaskSession[] = taskSessionRows.map((row) => {
      const plan = parseJson<NonNullable<TaskSession['plan']> | undefined>(row.planJson, undefined)
      const taskSession: TaskSession = {
        id: row.id,
        adapterId: row.adapterId,
        prompt: row.prompt,
        status: row.status,
        workspace: workspaceById.get(row.workspaceId) ?? fallbackWorkspace(row.workspaceId),
        events: eventsByTaskSessionId.get(row.id) ?? [],
        createdAt: row.createdAt,
        updatedAt: row.updatedAt
      }

      if (plan) {
        taskSession.plan = plan
      }

      if (row.executionSummary) {
        taskSession.executionSummary = row.executionSummary
      }

      if (row.approvedBy) {
        taskSession.approvedBy = row.approvedBy
      }

      return taskSession
    })

    const activeTask = history.find((session) => session.id === settingsRow.activeTaskId) ?? null

    return {
      schemaVersion: settingsRow.schemaVersion ?? currentDesktopSchemaVersion,
      activeTask,
      history,
      settings: {
        telemetryEnabled: settingsRow.telemetryEnabled === 1,
        releaseChannel: settingsRow.releaseChannel ?? defaultDesktopSettings.releaseChannel
      },
      selectedWorkspaceId:
        settingsRow.selectedWorkspaceId ?? history[0]?.workspace.id ?? workspaces[0]?.id ?? '',
      workspaces: Array.from(workspaceById.values())
    }
  }
}
