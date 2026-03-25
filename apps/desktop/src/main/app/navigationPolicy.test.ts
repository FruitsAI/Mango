// @vitest-environment node

import { describe, expect, it } from 'vitest'

import { isTrustedDesktopUrl } from './navigationPolicy'

describe('isTrustedDesktopUrl', () => {
  it('allows only the configured dev server during local development', () => {
    expect(isTrustedDesktopUrl('http://127.0.0.1:5173/', 'http://127.0.0.1:5173')).toBe(true)
    expect(isTrustedDesktopUrl('https://github.com/FruitsAI/Mango', 'http://127.0.0.1:5173')).toBe(
      false
    )
  })

  it('allows packaged file urls in production builds', () => {
    expect(isTrustedDesktopUrl('file:///C:/Program%20Files/Mango/index.html')).toBe(true)
    expect(isTrustedDesktopUrl('https://example.com')).toBe(false)
  })
})
