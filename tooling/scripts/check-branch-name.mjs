import { execSync } from 'node:child_process'

const allowedExactNames = new Set(['main', 'develop'])
const branchPattern =
  /^(codex|feat|fix|docs|refactor|test|chore|ci|build|perf|hotfix|release)\/[a-z0-9]+(?:-[a-z0-9]+)*$/

const branchName = execSync('git branch --show-current', {
  encoding: 'utf8',
  stdio: ['ignore', 'pipe', 'ignore']
}).trim()

if (branchName.length === 0) {
  console.error('未检测到当前分支名称，可能处于 detached HEAD。')
  process.exit(1)
}

if (allowedExactNames.has(branchName) || branchPattern.test(branchName)) {
  console.log(`Branch name check passed: ${branchName}`)
  process.exit(0)
}

console.error(`Invalid branch name: ${branchName}`)
console.error('允许格式示例：')
console.error('- codex/mango-standards')
console.error('- feat/workspace-history')
console.error('- fix/desktop-ipc-timeout')
console.error('- docs/api-naming-rules')
console.error('- release/v0-2-0')
process.exit(1)
