// @vitest-environment node

import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import {
  FileDesktopStore,
  currentDesktopSchemaVersion,
  defaultDesktopSettings
} from './fileDesktopStore'
import { SQLiteDesktopStore } from './sqliteDesktopStore'

const createSamplePersistedState = (rootPath: string) => {
  const workspace = {
    id: 'workspace-main',
    name: 'Main workspace',
    rootPath,
    shell: 'powershell',
    gitBranch: 'main',
    gitStatusSummary: 'clean',
    envAllowList: ['PATH'],
    recentTaskIds: ['task-001'],
    providerConfig: {
      configuredAdapters: ['mock-claude']
    }
  }

  const activeTask = {
    id: 'task-001',
    adapterId: 'mock-claude',
    prompt: 'Move Mango persistence to SQLite',
    status: 'succeeded' as const,
    workspace,
    plan: {
      headline: 'Persist Mango state in SQLite',
      summary: 'Create a SQLite store and import legacy JSON state.',
      steps: ['Create SQLite store', 'Import legacy JSON'],
      requestedPermissions: []
    },
    events: [
      {
        id: 'event-001',
        type: 'terminal.output' as const,
        level: 'info' as const,
        message: 'Running migration catalog',
        createdAt: '2026-03-24T00:00:00.000Z'
      },
      {
        id: 'event-002',
        type: 'summary.ready' as const,
        level: 'info' as const,
        message: 'SQLite import finished',
        summary: 'Migration completed successfully.',
        createdAt: '2026-03-24T00:00:01.000Z'
      }
    ],
    executionSummary: 'Migration completed successfully.',
    approvedBy: 'desktop-user',
    createdAt: '2026-03-24T00:00:00.000Z',
    updatedAt: '2026-03-24T00:00:02.000Z'
  }

  return {
    schemaVersion: currentDesktopSchemaVersion,
    activeTask,
    history: [activeTask],
    settings: defaultDesktopSettings,
    selectedWorkspaceId: workspace.id,
    workspaces: [workspace]
  }
}

describe('SQLiteDesktopStore', () => {
  it('loads better-sqlite3 as the desktop persistence runtime', async () => {
    await expect(import('better-sqlite3')).resolves.toMatchObject({
      default: expect.any(Function)
    })
  })

  it('writes and reads desktop state through SQLite', async () => {
    const tempDirectory = await mkdtemp(join(tmpdir(), 'mango-sqlite-store-'))
    const databasePath = join(tempDirectory, 'desktop-state.db')
    const state = createSamplePersistedState(tempDirectory)
    const store = new SQLiteDesktopStore(databasePath)

    try {
      await store.write(state)

      const restored = await store.read()

      expect(restored).not.toBeNull()
      expect(restored?.schemaVersion).toBe(currentDesktopSchemaVersion)
      expect(restored?.selectedWorkspaceId).toBe(state.selectedWorkspaceId)
      expect(restored?.history).toHaveLength(1)
      expect(restored?.activeTask?.events).toHaveLength(2)
      expect(restored?.activeTask?.executionSummary).toBe('Migration completed successfully.')
      expect(restored?.workspaces[0]?.providerConfig?.configuredAdapters).toEqual(['mock-claude'])
    } finally {
      store.close()
      await rm(tempDirectory, { recursive: true, force: true })
    }
  })

  it('imports legacy JSON state into SQLite on first read when database is empty', async () => {
    const tempDirectory = await mkdtemp(join(tmpdir(), 'mango-sqlite-store-'))
    const databasePath = join(tempDirectory, 'desktop-state.db')
    const legacyFilePath = join(tempDirectory, 'desktop-state.json')
    const state = createSamplePersistedState(tempDirectory)
    const legacyStore = new FileDesktopStore(legacyFilePath)
    const store = new SQLiteDesktopStore(databasePath, legacyStore)

    try {
      await legacyStore.write(state)

      const imported = await store.read()

      expect(imported).not.toBeNull()
      expect(imported?.history).toHaveLength(1)
      expect(imported?.activeTask?.id).toBe('task-001')

      await rm(legacyFilePath, { force: true })

      const restored = await store.read()

      expect(restored).not.toBeNull()
      expect(restored?.activeTask?.id).toBe('task-001')
      expect(restored?.settings.releaseChannel).toBe('beta')
    } finally {
      store.close()
      await rm(tempDirectory, { recursive: true, force: true })
    }
  })
})
