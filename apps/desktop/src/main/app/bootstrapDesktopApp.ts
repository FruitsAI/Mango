import { join } from 'node:path'

import { app, BrowserWindow, shell } from 'electron'

import type { GeneratePlanInput } from '@mango/contracts'

import { registerDesktopIpcHandlers } from '../ipc/registerDesktopIpcHandlers'
import { FileDesktopStore } from '../persistence/fileDesktopStore'
import { SQLiteDesktopStore } from '../persistence/sqliteDesktopStore'
import { DesktopController } from '../services/desktopController'

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined
declare const MAIN_WINDOW_VITE_NAME: string

let mainWindow: BrowserWindow | null = null

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1540,
    height: 980,
    minWidth: 1180,
    minHeight: 760,
    backgroundColor: '#140f0a',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: join(__dirname, '../../preload/index.mjs'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    void mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    void mainWindow.loadFile(join(__dirname, `../../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`))
  }
}

export const bootstrapDesktopApp = () => {
  const legacyStore = new FileDesktopStore(join(app.getPath('userData'), 'desktop-state.json'))
  const store = new SQLiteDesktopStore(
    join(app.getPath('userData'), 'desktop-state.db'),
    legacyStore
  )
  const controller = new DesktopController(store)

  app.whenReady().then(() => {
    registerDesktopIpcHandlers({
      bootstrap: () => controller.bootstrap(),
      generatePlan: (input: GeneratePlanInput) => controller.generatePlan(input),
      approveAndRun: () => controller.approveAndRun(),
      openFeedback: async () => {
        await shell.openExternal('https://github.com/FruitsAI/Mango/issues/new/choose')
      }
    })

    createMainWindow()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow()
      }
    })
  })

  app.on('window-all-closed', () => {
    store.close()

    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
}
