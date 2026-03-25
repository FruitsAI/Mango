import { ipcRenderer } from 'electron'

import { MANGO_DESKTOP_CHANNELS, type DesktopApi, type GeneratePlanInput } from '@mango/contracts'

export const createDesktopApi = (): DesktopApi => ({
  bootstrap: () => ipcRenderer.invoke(MANGO_DESKTOP_CHANNELS.bootstrap),
  generatePlan: (input: GeneratePlanInput) =>
    ipcRenderer.invoke(MANGO_DESKTOP_CHANNELS.generatePlan, input),
  approveAndRun: () => ipcRenderer.invoke(MANGO_DESKTOP_CHANNELS.approveAndRun),
  openFeedback: () => ipcRenderer.invoke(MANGO_DESKTOP_CHANNELS.openFeedback)
})
