import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export const workspaceImportPatterns = [
  '@mango/*/src/*',
  '../../packages/*/src/*',
  '../../../packages/*/src/*'
]

export const baseConfig = tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/out/**',
      '**/coverage/**',
      '**/.turbo/**',
      '**/*.d.ts',
      '**/*.d.mts',
      '**/playwright-report/**',
      '**/test-results/**'
    ]
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: process.cwd()
      }
    },
    rules: {
      '@typescript-eslint/ban-ts-comment': [
        'error',
        {
          minimumDescriptionLength: 8,
          'ts-check': false,
          'ts-expect-error': 'allow-with-description',
          'ts-ignore': true,
          'ts-nocheck': true
        }
      ],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports'
        }
      ],
      '@typescript-eslint/naming-convention': [
        'error',
        {
          selector: 'default',
          format: ['camelCase'],
          leadingUnderscore: 'allow'
        },
        {
          selector: 'import',
          format: ['camelCase', 'PascalCase']
        },
        {
          selector: 'variable',
          modifiers: ['const'],
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
          leadingUnderscore: 'allow'
        },
        {
          selector: 'variable',
          format: ['camelCase', 'PascalCase'],
          leadingUnderscore: 'allow'
        },
        {
          selector: 'function',
          format: ['camelCase', 'PascalCase'],
          leadingUnderscore: 'allow'
        },
        {
          selector: 'typeLike',
          format: ['PascalCase']
        },
        {
          selector: 'enumMember',
          format: ['UPPER_CASE', 'PascalCase']
        },
        {
          selector: 'objectLiteralProperty',
          format: null
        },
        {
          selector: 'typeProperty',
          format: ['camelCase', 'PascalCase']
        }
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_'
        }
      ],
      'no-restricted-imports': [
        'error',
        {
          patterns: workspaceImportPatterns
        }
      ],
      'spaced-comment': [
        'error',
        'always',
        {
          markers: ['/']
        }
      ]
    }
  }
)
