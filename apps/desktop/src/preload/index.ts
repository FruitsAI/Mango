import { contextBridge } from 'electron'

import { createDesktopApi } from './api/desktopApi'

contextBridge.exposeInMainWorld('mangoDesktop', createDesktopApi())
