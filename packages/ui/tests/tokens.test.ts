import { colorTokens, fontTokens } from '../src/index'

describe('@mango/ui tokens', () => {
  it('exports the mango brand palette and typography tokens', () => {
    expect(colorTokens.mango).toBe('#ffb328')
    expect(colorTokens.signal).toBe('#ff8a30')
    expect(fontTokens.display).toContain('Syne')
  })
})
