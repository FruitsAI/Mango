// @vitest-environment node

import { existsSync, readFileSync } from 'node:fs'

import {
  desktopSqliteMigrations,
  getLatestDesktopSqliteMigrationVersion
} from './sqliteMigrationCatalog'

describe('desktop sqlite migration catalog', () => {
  it('keeps at least one ordered migration for the future SQLite store', () => {
    expect(desktopSqliteMigrations.length).toBeGreaterThan(0)
    expect(desktopSqliteMigrations[0]?.version).toBe(1)
    expect(getLatestDesktopSqliteMigrationVersion()).toBe(desktopSqliteMigrations.at(-1)?.version)
  })

  it('ships both up and rollback SQL files for each registered migration', () => {
    for (const migration of desktopSqliteMigrations) {
      expect(existsSync(migration.upFilePath)).toBe(true)
      expect(existsSync(migration.downFilePath)).toBe(true)

      const upSql = readFileSync(migration.upFilePath, 'utf8')
      const downSql = readFileSync(migration.downFilePath, 'utf8')

      expect(upSql).toContain('BEGIN IMMEDIATE;')
      expect(upSql).toContain('CREATE TABLE')
      expect(downSql).toContain('BEGIN IMMEDIATE;')
      expect(downSql).toContain('DROP TABLE')
    }
  })
})
