import { access } from 'node:fs/promises'
import { resolve } from 'node:path'

const repoRoot = resolve(import.meta.dirname, '..', '..')

const requiredOutputs = [
  'apps/desktop/out/main/index.js',
  'apps/desktop/out/preload/index.mjs',
  'apps/desktop/out/renderer/index.html'
]

for (const relativePath of requiredOutputs) {
  await access(resolve(repoRoot, relativePath))
}

console.log('Desktop smoke check passed.')
