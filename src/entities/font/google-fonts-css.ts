import type { GoogleFontFamily } from './types'
import { resolveGoogleFontFromStack } from './google-fonts-catalog'

function encodeFamily(family: string): string {
  return encodeURIComponent(family).replaceAll('%20', '+')
}

export function createGoogleFontsCssUrl(font: GoogleFontFamily): string {
  const tuples = font.variants
    .flatMap((variant) => {
      const italic = variant.style === 'italic' ? 1 : 0
      if (variant.weightRange)
        return [`${italic},${variant.weightRange[0]}..${variant.weightRange[1]}`]
      return variant.weights.map(weight => `${italic},${weight}`)
    })
    .sort((a, b) => {
      const [aItalic, aWeight] = a.split(',').map(Number)
      const [bItalic, bWeight] = b.split(',').map(Number)
      return aItalic - bItalic || aWeight - bWeight
    })

  const family = encodeFamily(font.family)
  if (tuples.length === 0)
    return `https://fonts.googleapis.com/css2?family=${family}&display=swap`
  return `https://fonts.googleapis.com/css2?family=${family}:ital,wght@${tuples.join(';')}&display=swap`
}

export function getGoogleFontsCssUrlForStack(stack: string): string | undefined {
  const font = resolveGoogleFontFromStack(stack)
  return font ? createGoogleFontsCssUrl(font) : undefined
}

export function createGoogleFontsCssImport(stack: string): string | undefined {
  const url = getGoogleFontsCssUrlForStack(stack)
  return url ? `@import url("${url}");` : undefined
}
