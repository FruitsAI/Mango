import type { DesktopApi } from '@mango/contracts'

import { buildMockDesktopState } from '../app/fixtures'

const fallbackApi: DesktopApi = {
  bootstrap: async () => buildMockDesktopState(),
  generatePlan: async () => buildMockDesktopState(),
  approveAndRun: async () => buildMockDesktopState(),
  openFeedback: async () => undefined
}

export const getDesktopApi = (): DesktopApi =>
  typeof window !== 'undefined' && window.mangoDesktop ? window.mangoDesktop : fallbackApi
