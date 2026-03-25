/// <reference types="vite/client" />

import type { DesktopApi } from '@mango/contracts'

declare global {
  interface Window {
    mangoDesktop?: DesktopApi
  }
}
