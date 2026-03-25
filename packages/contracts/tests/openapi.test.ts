import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

describe('@mango/contracts openapi', () => {
  const openapiFilePath = resolve(__dirname, '..', 'openapi', 'openapi.yaml')

  it('keeps an explicit OpenAPI entrypoint checked into the repo', () => {
    expect(existsSync(openapiFilePath)).toBe(true)
  })

  it('pins the current Mango v1 OpenAPI baseline and key task session contract', () => {
    const content = readFileSync(openapiFilePath, 'utf8')

    expect(content).toContain('openapi: 3.1.1')
    expect(content).toContain('/task-sessions:')
    expect(content).toContain('operationId: listTaskSessions')
    expect(content).toContain('ErrorResponse:')
  })
})
