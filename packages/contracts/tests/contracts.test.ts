import {
  MANGO_DESKTOP_CHANNELS,
  type DesktopApiErrorCode,
  type GeneratePlanInput
} from '../src/index'

describe('@mango/contracts', () => {
  it('exposes stable desktop ipc channel names', () => {
    expect(MANGO_DESKTOP_CHANNELS.bootstrap).toBe('mango:bootstrap')
    expect(MANGO_DESKTOP_CHANNELS.generatePlan).toBe('mango:generate-plan')
    expect(MANGO_DESKTOP_CHANNELS.approveAndRun).toBe('mango:approve-and-run')
  })

  it('keeps desktop request payloads explicit', () => {
    const payload: GeneratePlanInput = {
      prompt: 'Draft the next Mango milestone',
      workspaceId: 'workspace-main',
      adapterId: 'mock-claude'
    }

    const code: DesktopApiErrorCode = 'TASK_STATE_INVALID'

    expect(payload.workspaceId).toBe('workspace-main')
    expect(code).toBe('TASK_STATE_INVALID')
  })
})
