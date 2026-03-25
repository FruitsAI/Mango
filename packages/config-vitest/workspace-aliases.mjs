import { resolve } from 'node:path'

export const createWorkspaceAliases = (dirname) => ({
  '@mango/core': resolve(dirname, '../core/src/index.ts'),
  '@mango/adapters': resolve(dirname, '../adapters/src/index.ts'),
  '@mango/contracts': resolve(dirname, '../contracts/src/index.ts'),
  '@mango/ui': resolve(dirname, '../ui/src/index.ts')
})
