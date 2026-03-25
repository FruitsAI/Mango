import type {
  PermissionCapability,
  PermissionDecision,
  PermissionPolicy,
  PermissionRequest
} from './types'

const capabilityLabels: Record<PermissionCapability, string> = {
  shell: 'Approve shell execution',
  filesystem: 'Approve file changes',
  network: 'Approve network access',
  browser: 'Approve browser automation'
}

const capabilityRisk: Record<PermissionCapability, PermissionDecision['risk']> = {
  shell: 'medium',
  filesystem: 'medium',
  network: 'high',
  browser: 'high'
}

export const createPermissionRequest = (
  capability: PermissionCapability,
  reason: string
): PermissionRequest => ({
  capability,
  reason
})

export const createDefaultPermissionPolicy = (): PermissionPolicy => ({
  id: 'default-visible-approval',
  name: 'Visible approval',
  evaluate: (request) => ({
    ...request,
    requiresApproval: true,
    risk: capabilityRisk[request.capability],
    label: capabilityLabels[request.capability]
  })
})

export const evaluatePermissionRequests = (
  policy: PermissionPolicy,
  requests: PermissionRequest[]
): PermissionDecision[] => requests.map((request) => policy.evaluate(request))
