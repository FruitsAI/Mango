import { fileURLToPath } from 'node:url'

export interface DesktopSqliteMigration {
  version: number
  name: string
  upFilePath: string
  downFilePath: string
}

const resolveMigrationFilePath = (fileName: string): string =>
  fileURLToPath(new URL(`./migrations/${fileName}`, import.meta.url))

export const desktopSqliteMigrations: DesktopSqliteMigration[] = [
  {
    version: 1,
    name: 'create_desktop_runtime_tables',
    upFilePath: resolveMigrationFilePath('0001_create_desktop_runtime_tables.sql'),
    downFilePath: resolveMigrationFilePath('0001_create_desktop_runtime_tables.rollback.sql')
  }
]

export const getLatestDesktopSqliteMigrationVersion = (): number =>
  desktopSqliteMigrations.at(-1)?.version ?? 0
