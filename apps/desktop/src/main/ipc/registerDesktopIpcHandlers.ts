import { ipcMain } from 'electron'

import { MANGO_DESKTOP_CHANNELS, type GeneratePlanInput } from '@mango/contracts'

interface DesktopIpcHandlers {
  bootstrap: () => Promise<unknown>
  generatePlan: (input: GeneratePlanInput) => Promise<unknown>
  approveAndRun: () => Promise<unknown>
  openFeedback: () => Promise<void>
}

export const registerDesktopIpcHandlers = (handlers: DesktopIpcHandlers) => {
  ipcMain.handle(MANGO_DESKTOP_CHANNELS.bootstrap, () => handlers.bootstrap())
  ipcMain.handle(MANGO_DESKTOP_CHANNELS.generatePlan, (_event, input: GeneratePlanInput) =>
    handlers.generatePlan(input)
  )
  ipcMain.handle(MANGO_DESKTOP_CHANNELS.approveAndRun, () => handlers.approveAndRun())
  ipcMain.handle(MANGO_DESKTOP_CHANNELS.openFeedback, () => handlers.openFeedback())
}
