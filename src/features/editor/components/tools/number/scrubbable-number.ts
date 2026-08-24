export type ScrubbableNumberValue = number | 'mixed' | undefined

interface ScrubNumberOptions {
  deltaX: number
  max: number
  min: number
  pixelsPerStep: number
  precision: number
  startValue: number
  step: number
}

export function clampNumber(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

export function roundNumber(value: number, precision: number) {
  const factor = 10 ** precision
  return Math.round(value * factor) / factor
}

export function scrubNumber(options: ScrubNumberOptions) {
  const steps = Math.round(options.deltaX / options.pixelsPerStep)
  return roundNumber(
    clampNumber(options.startValue + steps * options.step, options.min, options.max),
    options.precision,
  )
}

export function parseScrubbableNumber(value: string) {
  const normalized = value.trim().replace(',', '.')
  if (!normalized || normalized.toLowerCase() === 'auto')
    return undefined

  const number = Number(normalized)
  return Number.isFinite(number) ? number : null
}

export function formatScrubbableNumber(value: ScrubbableNumberValue, precision: number) {
  if (value === 'mixed')
    return 'Mixed'
  if (value === undefined)
    return 'Auto'
  return String(roundNumber(value, precision))
}
