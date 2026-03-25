const allowedTypes = [
  'feat',
  'fix',
  'docs',
  'refactor',
  'test',
  'chore',
  'build',
  'ci',
  'perf',
  'revert'
]

const title = process.argv
  .slice(2)
  .filter((argument, index) => !(index === 0 && argument === '--'))
  .join(' ')
  .trim()

if (!title) {
  console.error('PR title check failed: title is required.')
  console.error(
    'Usage: node tooling/scripts/check-pr-title.mjs "feat(repo): add release standards"'
  )
  process.exit(1)
}

if (title.length > 100) {
  console.error(`PR title check failed: title length ${title.length} exceeds 100 characters.`)
  process.exit(1)
}

if (title.endsWith('.')) {
  console.error('PR title check failed: title must not end with a period.')
  process.exit(1)
}

const titlePattern = new RegExp(`^(${allowedTypes.join('|')})(\\([a-z0-9-]+\\))?(!)?: .+$`)

if (!titlePattern.test(title)) {
  console.error('PR title check failed: title must follow Conventional Commits format.')
  console.error('Expected: <type>(<scope>): <summary>')
  console.error(`Allowed types: ${allowedTypes.join(', ')}`)
  process.exit(1)
}

console.log(`PR title check passed: ${title}`)
