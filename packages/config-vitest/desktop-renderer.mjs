import { resolve } from 'node:path'

import { defineConfig } from 'vitest/config'

export const createDesktopRendererVitestConfig = (dirname) =>
  defineConfig({
    resolve: {
      alias: {
        '@mango/core': resolve(dirname, '../../packages/core/src/index.ts'),
        '@mango/adapters': resolve(dirname, '../../packages/adapters/src/index.ts'),
        '@mango/contracts': resolve(dirname, '../../packages/contracts/src/index.ts'),
        '@mango/ui': resolve(dirname, '../../packages/ui/src/index.ts')
      }
    },
    test: {
      environment: 'jsdom',
      globals: true,
      include: ['src/renderer/src/test/**/*.test.tsx'],
      setupFiles: ['./src/renderer/src/test/setup.ts']
    }
  })
