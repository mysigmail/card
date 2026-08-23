import type { BorderRadiusValue } from './types'

export const BORDER_RADIUS_CORNERS = ['topLeft', 'topRight', 'bottomRight', 'bottomLeft'] as const

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonNegativeFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0
}

export function normalizeBorderRadiusValue(value: unknown): BorderRadiusValue | undefined {
  if (!isRecord(value))
    return undefined
  const keys = Object.keys(value)
  if (
    keys.length !== BORDER_RADIUS_CORNERS.length
    || !keys.every(key => (BORDER_RADIUS_CORNERS as readonly string[]).includes(key))
  ) {
    return undefined
  }
  if (!BORDER_RADIUS_CORNERS.every(corner => isNonNegativeFiniteNumber(value[corner])))
    return undefined
  return Object.fromEntries(
    BORDER_RADIUS_CORNERS.map(corner => [corner, value[corner]]),
  ) as unknown as BorderRadiusValue
}

export function createBorderRadiusValue(value: number): BorderRadiusValue {
  return {
    topLeft: value,
    topRight: value,
    bottomRight: value,
    bottomLeft: value,
  }
}

export function resolveBorderRadiusStyle(value?: BorderRadiusValue): string | undefined {
  const normalized = normalizeBorderRadiusValue(value)
  if (normalized === undefined)
    return undefined
  // Classic Outlook for Windows ignores CSS border-radius; square-corner degradation is expected.
  return BORDER_RADIUS_CORNERS.map(corner => `${normalized[corner]}px`).join(' ')
}

export function hasPositiveBorderRadius(value?: BorderRadiusValue) {
  const normalized = normalizeBorderRadiusValue(value)
  return normalized !== undefined && BORDER_RADIUS_CORNERS.some(corner => normalized[corner] > 0)
}
