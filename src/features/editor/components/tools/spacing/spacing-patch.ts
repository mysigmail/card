import type { Insets, SpacingValue } from '@/entities/style'

export function createSpacingPatch(
  value: SpacingValue,
  side: keyof SpacingValue,
  next: Insets,
): SpacingValue {
  const otherSide = side === 'padding' ? 'margin' : 'padding'
  const patch: SpacingValue = { [side]: next }
  const otherValue = value[otherSide]

  if (otherValue)
    patch[otherSide] = [...otherValue]

  return patch
}
