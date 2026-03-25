import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'

import { workspaceImportPatterns } from './base.mjs'

export const rendererConfig = [
  {
    files: ['apps/desktop/src/renderer/src/**/*.{ts,tsx}'],
    languageOptions: {
      globals: globals.browser
    },
    plugins: {
      'react-hooks': reactHooks
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'electron',
              message: 'Renderer 不允许直接依赖 Electron API，请改走 preload 暴露的安全桥。'
            }
          ],
          patterns: [...workspaceImportPatterns, 'node:*']
        }
      ]
    }
  }
]
