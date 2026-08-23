import type { BorderValue } from '@/entities/style'
import { BORDER_SIDES } from '@/entities/style'

export function resolveBorderStyle(border?: BorderValue): Record<string, string> {
  if (!border)
    return {}

  const style: Record<string, string> = {}
  for (const side of BORDER_SIDES) {
    const value = border[side]
    if (!value)
      continue
    const property = `border${side[0]!.toUpperCase()}${side.slice(1)}`
    style[property] = `${value.width}px ${value.style} ${value.color}`
  }
  return style
}
