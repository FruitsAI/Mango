import { spawnSync } from 'node:child_process'
import { chmodSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const currentFilePath = fileURLToPath(import.meta.url)
const repoRoot = join(dirname(currentFilePath), '..', '..')
const hooksDir = join(repoRoot, '.githooks')
const hookFiles = ['commit-msg', 'pre-commit']

if (process.env.CI) {
  console.log('Skipping git hooks installation in CI.')
  process.exit(0)
}

if (!existsSync(hooksDir)) {
  console.log('Skipping git hooks installation because .githooks was not found.')
  process.exit(0)
}

for (const hookFile of hookFiles) {
  const hookPath = join(hooksDir, hookFile)

  if (existsSync(hookPath)) {
    chmodSync(hookPath, 0o755)
  }
}

const insideWorkTree = spawnSync('git', ['rev-parse', '--is-inside-work-tree'], {
  cwd: repoRoot,
  encoding: 'utf8'
})

if (insideWorkTree.status !== 0) {
  console.log('Skipping git hooks installation because current directory is not a git work tree.')
  process.exit(0)
}

const installResult = spawnSync('git', ['config', 'core.hooksPath', '.githooks'], {
  cwd: repoRoot,
  encoding: 'utf8'
})

if (installResult.status !== 0) {
  console.error('Failed to install git hooks.')
  console.error(installResult.stderr.trim())
  process.exit(installResult.status ?? 1)
}

console.log('Git hooks installed: .githooks')
