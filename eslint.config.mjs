import { baseConfig } from './packages/config-eslint/base.mjs'
import { electronProcessConfig } from './packages/config-eslint/electron-processes.mjs'
import { rendererConfig } from './packages/config-eslint/renderer.mjs'

export default [...baseConfig, ...electronProcessConfig, ...rendererConfig]
