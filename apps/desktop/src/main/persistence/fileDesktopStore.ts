import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

import type { DesktopSettings } from '@mango/contracts'
import type { TaskSession, WorkspaceContext } from '@mango/core'

export interface PersistedDesktopState {
  schemaVersion: number
  activeTask: TaskSession | null
  history: TaskSession[]
  settings: DesktopSettings
  selectedWorkspaceId: string
  workspaces: WorkspaceContext[]
}

export interface DesktopStateStore {
  read: () => Promise<PersistedDesktopState | null>
  write: (state: PersistedDesktopState) => Promise<void>
}

type LegacyPersistedDesktopState = Omit<PersistedDesktopState, 'schemaVersion'> & {
  schemaVersion?: number
}

export const currentDesktopSchemaVersion = 1

export const defaultDesktopSettings: DesktopSettings = {
  telemetryEnabled: true,
  releaseChannel: 'beta'
}

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const normalizePersistedDesktopState = (value: unknown): PersistedDesktopState | null => {
  if (!isObjectRecord(value)) {
    return null
  }

  const candidate = value as LegacyPersistedDesktopState

  if (!Array.isArray(candidate.history) || !Array.isArray(candidate.workspaces)) {
    return null
  }

  if (!candidate.settings || typeof candidate.selectedWorkspaceId !== 'string') {
    return null
  }

  const nextSchemaVersion =
    candidate.schemaVersion === undefined
      ? currentDesktopSchemaVersion
      : candidate.schemaVersion === currentDesktopSchemaVersion
        ? candidate.schemaVersion
        : null

  if (nextSchemaVersion === null) {
    return null
  }

  return {
    schemaVersion: nextSchemaVersion,
    activeTask: candidate.activeTask ?? null,
    history: candidate.history,
    settings: candidate.settings,
    selectedWorkspaceId: candidate.selectedWorkspaceId,
    workspaces: candidate.workspaces
  }
}

export class FileDesktopStore implements DesktopStateStore {
  public constructor(private readonly filePath: string) {}

  public async read(): Promise<PersistedDesktopState | null> {
    try {
      const raw = await readFile(this.filePath, 'utf8')
      return normalizePersistedDesktopState(JSON.parse(raw))
    } catch {
      return null
    }
  }

  public async write(state: PersistedDesktopState): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true })
    await writeFile(
      this.filePath,
      JSON.stringify(
        {
          ...state,
          schemaVersion: currentDesktopSchemaVersion
        },
        null,
        2
      ),
      'utf8'
    )
  }
}
