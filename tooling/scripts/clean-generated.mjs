import { rm } from 'node:fs/promises'
import { resolve } from 'node:path'

const repoRoot = resolve(import.meta.dirname, '..', '..')

const generatedPaths = [
  '.turbo',
  'apps/desktop/out',
  'apps/desktop/dist',
  'packages/core/dist',
  'packages/adapters/dist',
  'packages/contracts/dist',
  'packages/ui/dist',
  'packages/core/src/index.js',
  'packages/core/src/index.d.ts',
  'packages/core/src/permissionPolicy.js',
  'packages/core/src/permissionPolicy.d.ts',
  'packages/core/src/taskSession.js',
  'packages/core/src/taskSession.d.ts',
  'packages/core/src/types.js',
  'packages/core/src/types.d.ts',
  'packages/core/src/workspace.js',
  'packages/core/src/workspace.d.ts'
]

await Promise.all(
  generatedPaths.map((target) =>
    rm(resolve(repoRoot, target), {
      force: true,
      recursive: true
    })
  )
)

console.log('Generated artifacts cleaned.')
