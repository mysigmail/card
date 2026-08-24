import { describe, expect, it } from 'vitest'
import {
  formatScrubbableNumber,
  parseScrubbableNumber,
  scrubNumber,
} from '@/features/editor/components/tools/number/scrubbable-number'

describe('scrubbable number field', () => {
  it('uses Auto for an unset value and parses localized numbers', () => {
    expect(formatScrubbableNumber(undefined, 2)).toBe('Auto')
    expect(parseScrubbableNumber('Auto')).toBeUndefined()
    expect(parseScrubbableNumber('1,25')).toBe(1.25)
    expect(parseScrubbableNumber('not a number')).toBeNull()
  })

  it('converts horizontal movement into clamped stepped values', () => {
    expect(
      scrubNumber({
        deltaX: 12,
        max: 10,
        min: 0.5,
        pixelsPerStep: 4,
        precision: 2,
        startValue: 1.2,
        step: 0.1,
      }),
    ).toBe(1.5)

    expect(
      scrubNumber({
        deltaX: -100,
        max: 10,
        min: 0.5,
        pixelsPerStep: 4,
        precision: 2,
        startValue: 1.2,
        step: 0.1,
      }),
    ).toBe(0.5)
  })

  it('formats mixed and rounded values without trailing zeroes', () => {
    expect(formatScrubbableNumber('mixed', 2)).toBe('Mixed')
    expect(formatScrubbableNumber(1.2001, 2)).toBe('1.2')
  })
})
