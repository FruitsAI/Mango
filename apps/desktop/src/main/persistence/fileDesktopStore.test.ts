// @vitest-environment node

import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import {
  currentDesktopSchemaVersion,
  defaultDesktopSettings,
  FileDesktopStore
} from './fileDesktopStore'

describe('FileDesktopStore', () => {
  it('writes the current schemaVersion into persisted desktop state', async () => {
    const tempDirectory = await mkdtemp(join(tmpdir(), 'mango-file-store-'))
    const filePath = join(tempDirectory, 'desktop-state.json')
    const workspace = {
      id: 'workspace-main',
      name: 'Main workspace',
      rootPath: tempDirectory,
      shell: 'powershell',
      gitBranch: 'main',
      gitStatusSummary: 'clean',
      envAllowList: ['PATH'],
      recentTaskIds: [],
      providerConfig: {
        configuredAdapters: ['mock-claude']
      }
    }
    const session = {
      id: 'task-001',
      adapterId: 'mock-claude',
      prompt: 'Plan Mango persistence work',
      status: 'planned' as const,
      workspace,
      plan: {
        headline: 'Plan Mango persistence work',
        summary: 'Upgrade local desktop state and add migration scaffolding.',
        steps: ['Add schemaVersion', 'Add migration catalog'],
        requestedPermissions: []
      },
      events: [],
      createdAt: '2026-03-24T00:00:00.000Z',
      updatedAt: '2026-03-24T00:00:00.000Z'
    }
    const store = new FileDesktopStore(filePath)

    try {
      await store.write({
        schemaVersion: currentDesktopSchemaVersion,
        activeTask: session,
        history: [session],
        settings: defaultDesktopSettings,
        selectedWorkspaceId: workspace.id,
        workspaces: [workspace]
      })

      const content = await readFile(filePath, 'utf8')

      expect(content).toContain(`"schemaVersion": ${currentDesktopSchemaVersion}`)
    } finally {
      await rm(tempDirectory, { recursive: true, force: true })
    }
  }, 10000)

  it('upgrades legacy persisted state that has no schemaVersion field yet', async () => {
    const tempDirectory = await mkdtemp(join(tmpdir(), 'mango-file-store-'))
    const filePath = join(tempDirectory, 'desktop-state.json')
    const workspace = {
      id: 'workspace-main',
      name: 'Main workspace',
      rootPath: tempDirectory,
      shell: 'powershell',
      gitBranch: 'main',
      gitStatusSummary: 'clean',
      envAllowList: ['PATH'],
      recentTaskIds: [],
      providerConfig: {
        configuredAdapters: ['mock-claude']
      }
    }
    const session = {
      id: 'task-legacy',
      adapterId: 'mock-claude',
      prompt: 'Migrate legacy Mango state',
      status: 'draft' as const,
      workspace,
      events: [],
      createdAt: '2026-03-24T00:00:00.000Z',
      updatedAt: '2026-03-24T00:00:00.000Z'
    }
    const store = new FileDesktopStore(filePath)

    try {
      await writeFile(
        filePath,
        JSON.stringify(
          {
            activeTask: session,
            history: [session],
            settings: defaultDesktopSettings,
            selectedWorkspaceId: workspace.id,
            workspaces: [workspace]
          },
          null,
          2
        ),
        'utf8'
      )

      const state = await store.read()

      expect(state).not.toBeNull()
      expect(state?.schemaVersion).toBe(currentDesktopSchemaVersion)
      expect(state?.history).toHaveLength(1)
    } finally {
      await rm(tempDirectory, { recursive: true, force: true })
    }
  }, 10000)
})
