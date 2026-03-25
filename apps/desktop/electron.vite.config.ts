import { resolve } from 'node:path'

import react from '@vitejs/plugin-react'
import { defineConfig, externalizeDepsPlugin } from 'electron-vite'

const internalWorkspacePackages = [
  '@mango/core',
  '@mango/adapters',
  '@mango/contracts',
  '@mango/ui'
]

export default defineConfig({
  main: {
    resolve: {
      alias: {
        '@mango/core': resolve(__dirname, '../../packages/core/src/index.ts'),
        '@mango/adapters': resolve(__dirname, '../../packages/adapters/src/index.ts'),
        '@mango/contracts': resolve(__dirname, '../../packages/contracts/src/index.ts'),
        '@mango/ui': resolve(__dirname, '../../packages/ui/src/index.ts')
      }
    },
    plugins: [
      externalizeDepsPlugin({
        exclude: internalWorkspacePackages
      })
    ]
  },
  preload: {
    resolve: {
      alias: {
        '@mango/core': resolve(__dirname, '../../packages/core/src/index.ts'),
        '@mango/adapters': resolve(__dirname, '../../packages/adapters/src/index.ts'),
        '@mango/contracts': resolve(__dirname, '../../packages/contracts/src/index.ts'),
        '@mango/ui': resolve(__dirname, '../../packages/ui/src/index.ts')
      }
    },
    plugins: [
      externalizeDepsPlugin({
        exclude: internalWorkspacePackages
      })
    ]
  },
  renderer: {
    resolve: {
      alias: {
        '@mango/core': resolve(__dirname, '../../packages/core/src/index.ts'),
        '@mango/adapters': resolve(__dirname, '../../packages/adapters/src/index.ts'),
        '@mango/contracts': resolve(__dirname, '../../packages/contracts/src/index.ts'),
        '@mango/ui': resolve(__dirname, '../../packages/ui/src/index.ts')
      }
    },
    plugins: [react()]
  }
})
