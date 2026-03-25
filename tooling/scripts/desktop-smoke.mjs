import { access, readFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const repoRoot = resolve(import.meta.dirname, '..', '..')

const requiredOutputs = ['apps/desktop/out/main/index.js', 'apps/desktop/out/preload/index.mjs']

for (const relativePath of requiredOutputs) {
  await access(resolve(repoRoot, relativePath))
}

const rendererCandidates = ['out/renderer/index.html', 'apps/desktop/out/renderer/index.html']

let resolvedRendererOutput = null

for (const relativePath of rendererCandidates) {
  try {
    await access(resolve(repoRoot, relativePath))
    resolvedRendererOutput = relativePath
    break
  } catch {
    // Keep searching known renderer output locations.
  }
}

if (!resolvedRendererOutput) {
  throw new Error(
    `Desktop renderer output is missing. Checked: ${rendererCandidates
      .map((relativePath) => resolve(repoRoot, relativePath))
      .join(', ')}`
  )
}

const workspaceImportPattern = /['"]@mango\//
const legacyElectronViteGlobals = [/MAIN_WINDOW_VITE_DEV_SERVER_URL/, /MAIN_WINDOW_VITE_NAME/]

for (const relativePath of [...requiredOutputs, resolvedRendererOutput]) {
  const absolutePath = resolve(repoRoot, relativePath)
  const contents = await readFile(absolutePath, 'utf8')

  if (workspaceImportPattern.test(contents)) {
    throw new Error(
      `Desktop bundle still contains workspace package imports at runtime: ${absolutePath}`
    )
  }

  for (const pattern of legacyElectronViteGlobals) {
    if (pattern.test(contents)) {
      throw new Error(
        `Desktop bundle still contains deprecated electron-vite globals at runtime: ${absolutePath}`
      )
    }
  }
}

console.log('Desktop smoke check passed.')
