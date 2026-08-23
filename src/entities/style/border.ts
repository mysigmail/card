import type { BorderSideValue, BorderStyle, BorderValue } from './types'
import { normalizeEmailColor } from './email-color'

export const BORDER_SIDES = ['top', 'right', 'bottom', 'left'] as const
export const BORDER_STYLES: readonly BorderStyle[] = ['solid', 'dashed', 'dotted']

const BORDER_STYLE_SET = new Set<string>(BORDER_STYLES)
const OPAQUE_HEX_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function hasOnlyKeys(value: Record<string, unknown>, allowed: readonly string[]) {
  const allowedSet = new Set(allowed)
  return Object.keys(value).every(key => allowedSet.has(key))
}

export function normalizeOpaqueHex(value: string) {
  if (!OPAQUE_HEX_PATTERN.test(value))
    return undefined
  const hex = value.slice(1).toUpperCase()
  return hex.length === 3
    ? `#${hex
      .split('')
      .map(character => character.repeat(2))
      .join('')}`
    : `#${hex}`
}

export function createDefaultBorderSide(): BorderSideValue {
  return { width: 1, style: 'solid', color: '#000000' }
}

export function createDefaultBorder(): BorderValue {
  return Object.fromEntries(BORDER_SIDES.map(side => [side, createDefaultBorderSide()]))
}

export function normalizeBorderSide(value: unknown): BorderSideValue | undefined {
  if (!isRecord(value) || !hasOnlyKeys(value, ['width', 'style', 'color']))
    return undefined
  if (!Number.isInteger(value.width) || (value.width as number) < 1)
    return undefined
  if (typeof value.style !== 'string' || !BORDER_STYLE_SET.has(value.style))
    return undefined
  if (typeof value.color !== 'string')
    return undefined
  const color = normalizeEmailColor(value.color)
  if (!color)
    return undefined
  return { width: value.width as number, style: value.style as BorderStyle, color }
}

export function normalizeBorderValue(value: unknown): BorderValue | undefined {
  if (!isRecord(value) || !hasOnlyKeys(value, BORDER_SIDES))
    return undefined
  const result: BorderValue = {}
  for (const side of BORDER_SIDES) {
    if (!(side in value))
      continue
    const normalized = normalizeBorderSide(value[side])
    if (!normalized)
      return undefined
    result[side] = normalized
  }
  return Object.keys(result).length > 0 ? result : undefined
}
