export const DEFAULT_OPACITY = 100

export function normalizeOpacity(value: unknown): number | undefined {
  return typeof value === 'number'
    && Number.isInteger(value)
    && value >= 0
    && value <= DEFAULT_OPACITY
    ? value
    : undefined
}

export function resolveOpacity(value?: number): number {
  return normalizeOpacity(value) ?? DEFAULT_OPACITY
}

export function resolveOpacityStyle(value?: number): number {
  // Classic Outlook may ignore CSS opacity and render the content opaque. We intentionally
  // emit no filter/VML fallback: opaque degradation keeps content readable and predictable.
  return resolveOpacity(value) / DEFAULT_OPACITY
}

export function multiplyOpacityStyles(...values: number[]): number {
  return Number(values.reduce((product, value) => product * value, 1).toFixed(6))
}
