import { defineConfig } from 'vitest/config'

import { createWorkspaceAliases } from './workspace-aliases.mjs'

export const createNodePackageVitestConfig = (dirname) =>
  defineConfig({
    resolve: dirname
      ? {
          alias: createWorkspaceAliases(dirname)
        }
      : undefined,
    test: {
      globals: true,
      environment: 'node',
      include: ['tests/**/*.test.ts']
    }
  })
