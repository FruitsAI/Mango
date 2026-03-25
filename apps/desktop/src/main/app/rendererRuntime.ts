import { join } from 'node:path'

export const getRendererDevServerUrl = (env: NodeJS.ProcessEnv): string | undefined =>
  env.ELECTRON_RENDERER_URL

export const getRendererIndexHtmlPath = (currentDir: string): string =>
  join(currentDir, '../renderer/index.html')
