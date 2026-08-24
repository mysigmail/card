import { describe, expect, it } from 'vitest'
import {
  createGoogleFontsCssImport,
  createGoogleFontsCssUrl,
  createGoogleFontStack,
  getCategoryFallback,
  getGoogleFontFallback,
  getGoogleFontsCssUrlForStack,
  googleFontFamilies,
  googleFontsSnapshot,
  resolveGoogleFontFromStack,
} from '@/entities/font'

describe('google Fonts catalog', () => {
  it('contains a deterministic full snapshot from an official source commit', () => {
    expect(googleFontsSnapshot.source).toBe('https://github.com/google/fonts')
    expect(googleFontsSnapshot.sourceCommit).toMatch(/^[a-f\d]{40}$/)
    expect(googleFontFamilies.length).toBeGreaterThan(1900)

    const names = googleFontFamilies.map(font => font.family)
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, 'en')))
    expect(new Set(names).size).toBe(names.length)
    expect(googleFontFamilies.every(font => font.variants.length > 0)).toBe(true)
    expect(names).not.toContain('Batang')
    expect(names).not.toContain('BatangChe')
  })

  it('builds category-aware fallback stacks', () => {
    const inter = googleFontFamilies.find(font => font.family === 'Inter')!
    expect(createGoogleFontStack(inter)).toBe('"Inter", Arial, Helvetica, sans-serif')
    expect(getCategoryFallback('serif')).toBe('Georgia, "Times New Roman", serif')
    expect(getCategoryFallback('monospace')).toBe('"Courier New", Courier, monospace')

    const customStack = createGoogleFontStack(inter, 'Verdana, Arial, sans-serif')
    expect(customStack).toBe('"Inter", Verdana, Arial, sans-serif')
    expect(getGoogleFontFallback(customStack)).toBe('Verdana, Arial, sans-serif')
    expect(resolveGoogleFontFromStack(customStack)?.family).toBe('Inter')
  })

  it('builds sorted CSS2 tuples for variable normal and italic variants', () => {
    const inter = googleFontFamilies.find(font => font.family === 'Inter')!
    expect(createGoogleFontsCssUrl(inter)).toBe(
      'https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,100..900;1,100..900&display=swap',
    )
  })

  it('builds a safe Shadow DOM import only for a catalog font', () => {
    expect(createGoogleFontsCssImport('"Inter", Arial, Helvetica, sans-serif')).toBe(
      '@import url("https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,100..900;1,100..900&display=swap");',
    )
    expect(createGoogleFontsCssImport('"Unknown Font", Arial, sans-serif')).toBeUndefined()
  })

  it('resolves only catalog families from an exact or quoted stack', () => {
    const stack = '"Inter", Arial, Helvetica, sans-serif'
    expect(resolveGoogleFontFromStack(stack)?.family).toBe('Inter')
    expect(getGoogleFontsCssUrlForStack(stack)).toContain('family=Inter:')
    expect(getGoogleFontsCssUrlForStack('Arial, Helvetica, sans-serif')).toBeUndefined()
    expect(getGoogleFontsCssUrlForStack('"Unknown Font", Arial, sans-serif')).toBeUndefined()
  })
})
