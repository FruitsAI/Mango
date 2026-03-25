import globals from 'globals'

export const electronProcessConfig = [
  {
    files: [
      'apps/desktop/src/main/**/*.ts',
      'apps/desktop/src/preload/**/*.ts',
      '**/vitest.config.ts',
      '**/electron.vite.config.ts',
      'tooling/scripts/**/*.mjs',
      'packages/config-*/**/*.mjs'
    ],
    languageOptions: {
      globals: globals.node
    }
  }
]
