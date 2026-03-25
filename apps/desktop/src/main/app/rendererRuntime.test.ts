import { join } from 'node:path'

import { getRendererDevServerUrl, getRendererIndexHtmlPath } from './rendererRuntime'

describe('rendererRuntime', () => {
  it('reads the renderer dev server url from electron-vite env', () => {
    expect(
      getRendererDevServerUrl({
        ELECTRON_RENDERER_URL: 'http://localhost:5173'
      } as NodeJS.ProcessEnv)
    ).toBe('http://localhost:5173')
  })

  it('resolves the packaged renderer entry next to the main bundle', () => {
    expect(getRendererIndexHtmlPath('D:/workspace/apps/desktop/out/main')).toBe(
      join('D:/workspace/apps/desktop/out/main', '../renderer/index.html')
    )
  })
})
