import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const repoRoot = resolve(import.meta.dirname, '..', '..')

const checks = [
  {
    label: 'renderer imports are browser-safe',
    file: 'apps/desktop/src/renderer/src/lib/desktopApi.ts',
    forbidden: ["from 'electron'", "from 'node:"]
  },
  {
    label: 'renderer app entry avoids direct electron imports',
    file: 'apps/desktop/src/renderer/src/app/App.tsx',
    forbidden: ["from 'electron'", "from 'node:"]
  },
  {
    label: 'desktop main process consumes contracts from the public package',
    file: 'apps/desktop/src/main/app/bootstrapDesktopApp.ts',
    required: ["from '@mango/contracts'"],
    forbidden: ["from '../shared/contracts'", "from '../../shared/contracts'"]
  }
]

const failures = []

for (const check of checks) {
  const targetPath = resolve(repoRoot, check.file)
  const source = await readFile(targetPath, 'utf8')

  for (const pattern of check.required ?? []) {
    if (!source.includes(pattern)) {
      failures.push(`${check.label}: missing required pattern "${pattern}" in ${check.file}`)
    }
  }

  for (const pattern of check.forbidden ?? []) {
    if (source.includes(pattern)) {
      failures.push(`${check.label}: found forbidden pattern "${pattern}" in ${check.file}`)
    }
  }
}

if (failures.length > 0) {
  console.error('Architecture checks failed:')
  for (const failure of failures) {
    console.error(`- ${failure}`)
  }
  process.exit(1)
}

console.log('Architecture checks passed.')
