import { join } from 'node:path'

import { app, BrowserWindow, shell } from 'electron'

import type { GeneratePlanInput } from '@mango/contracts'

import { registerDesktopIpcHandlers } from '../ipc/registerDesktopIpcHandlers'
import { FileDesktopStore } from '../persistence/fileDesktopStore'
import { SQLiteDesktopStore } from '../persistence/sqliteDesktopStore'
import { DesktopController } from '../services/desktopController'
import { isTrustedDesktopUrl } from './navigationPolicy'
import { getRendererDevServerUrl, getRendererIndexHtmlPath } from './rendererRuntime'

let mainWindow: BrowserWindow | null = null

const createMainWindow = () => {
  const rendererDevServerUrl = getRendererDevServerUrl(process.env)

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

  const handleExternalNavigation = (url: string) => {
    if (isTrustedDesktopUrl(url, rendererDevServerUrl)) {
      return
    }

    void shell.openExternal(url)
  }

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    handleExternalNavigation(url)

    return {
      action: isTrustedDesktopUrl(url, rendererDevServerUrl) ? 'allow' : 'deny'
    }
  })

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (isTrustedDesktopUrl(url, rendererDevServerUrl)) {
      return
    }

    event.preventDefault()
    handleExternalNavigation(url)
  })

  if (rendererDevServerUrl) {
    void mainWindow.loadURL(rendererDevServerUrl)
    mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    void mainWindow.loadFile(getRendererIndexHtmlPath(__dirname))
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
