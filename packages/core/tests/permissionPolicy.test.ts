import { describe, expect, it } from 'vitest'

import {
  createDefaultPermissionPolicy,
  createPermissionRequest,
  evaluatePermissionRequests
} from '../src/index'

describe('default permission policy', () => {
  it('requires visible approval for high-risk capabilities', () => {
    const policy = createDefaultPermissionPolicy()

    const decisions = evaluatePermissionRequests(policy, [
      createPermissionRequest('shell', 'Run repository scripts'),
      createPermissionRequest('filesystem', 'Create implementation files'),
      createPermissionRequest('network', 'Fetch release metadata'),
      createPermissionRequest('browser', 'Open GitHub issues')
    ])

    expect(decisions.filter((decision) => decision.requiresApproval)).toHaveLength(4)
    expect(decisions.every((decision) => decision.label.length > 0)).toBe(true)
  })

  it('tags network and browser with high risk', () => {
    const policy = createDefaultPermissionPolicy()

    const decisions = evaluatePermissionRequests(policy, [
      createPermissionRequest('network', 'Call release feed'),
      createPermissionRequest('browser', 'Navigate docs site')
    ])

    expect(decisions.map((decision) => decision.risk)).toEqual(['high', 'high'])
  })
})
