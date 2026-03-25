import { resolve } from 'node:path'

import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@mango/core': resolve(__dirname, '../../packages/core/src/index.ts'),
      '@mango/adapters': resolve(__dirname, '../../packages/adapters/src/index.ts'),
      '@mango/contracts': resolve(__dirname, '../../packages/contracts/src/index.ts'),
      '@mango/ui': resolve(__dirname, '../../packages/ui/src/index.ts')
    }
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['src/main/**/*.test.ts']
  }
})
