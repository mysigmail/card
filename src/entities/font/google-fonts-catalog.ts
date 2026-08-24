import type { FontOption, GoogleFontCategory, GoogleFontFamily, GoogleFontsSnapshot } from './types'
import snapshotJson from './google-fonts.json'

export const SYSTEM_FONT_OPTIONS: FontOption[] = [
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Comic Sans MS', value: '"Comic Sans MS", sans-serif' },
  { label: 'Courier New', value: '"Courier New", Courier, monospace' },
  { label: 'Lucida Console', value: '"Lucida Console", Monaco, monospace' },
  { label: 'Lucida Grande', value: '"Lucida Grande", sans-serif' },
  { label: 'Tahoma', value: 'Tahoma, sans-serif' },
  { label: 'Trebuchet MS', value: '"Trebuchet MS", sans-serif' },
  { label: 'Verdana', value: 'Verdana, sans-serif' },
]

export const GOOGLE_FONT_FALLBACK_AUTO = '__auto__'

export const GOOGLE_FONT_FALLBACK_OPTIONS: FontOption[] = [
  { label: 'Auto', value: GOOGLE_FONT_FALLBACK_AUTO },
  { label: 'Arial / Helvetica', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Georgia / Times New Roman', value: 'Georgia, "Times New Roman", serif' },
  { label: 'Verdana', value: 'Verdana, Arial, sans-serif' },
  { label: 'Tahoma', value: 'Tahoma, Arial, sans-serif' },
  { label: 'Trebuchet MS', value: '"Trebuchet MS", Arial, sans-serif' },
  { label: 'Courier New', value: '"Courier New", Courier, monospace' },
  {
    label: 'System UI',
    value: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
]

export const googleFontsSnapshot = snapshotJson as GoogleFontsSnapshot
export const googleFontFamilies = googleFontsSnapshot.families

const familyByName = new Map(googleFontFamilies.map(font => [font.family, font]))

function parseFontStack(stack: string) {
  const value = stack.trim()
  if (!value)
    return undefined

  const quote = value[0]
  if (quote === '"' || quote === '\'') {
    let end = 1
    while (end < value.length) {
      if (value[end] === quote && value[end - 1] !== '\\')
        break
      end += 1
    }

    if (end >= value.length)
      return undefined

    const remainder = value.slice(end + 1).trimStart()
    if (!remainder.startsWith(','))
      return undefined

    return {
      family: value.slice(1, end).replaceAll(`\\${quote}`, quote),
      fallback: remainder.slice(1).trim(),
    }
  }

  const separator = value.indexOf(',')
  if (separator < 1)
    return undefined

  return {
    family: value.slice(0, separator).trim(),
    fallback: value.slice(separator + 1).trim(),
  }
}

export function getCategoryFallback(category: GoogleFontCategory): string {
  if (category === 'serif')
    return 'Georgia, "Times New Roman", serif'
  if (category === 'monospace')
    return '"Courier New", Courier, monospace'
  return 'Arial, Helvetica, sans-serif'
}

export function createGoogleFontStack(font: GoogleFontFamily, fallback?: string): string {
  return `"${font.family.replaceAll('"', '\\"')}", ${fallback ?? getCategoryFallback(font.category)}`
}

export function resolveGoogleFontFromStack(stack: string): GoogleFontFamily | undefined {
  const exact = googleFontFamilies.find(font => createGoogleFontStack(font) === stack)
  if (exact)
    return exact

  const parsed = parseFontStack(stack)
  return parsed ? familyByName.get(parsed.family) : undefined
}

export function getGoogleFontFallback(stack: string): string | undefined {
  if (!resolveGoogleFontFromStack(stack))
    return undefined

  return parseFontStack(stack)?.fallback || undefined
}
