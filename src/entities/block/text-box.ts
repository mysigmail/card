import type { TextAtom } from './types'
import type { SpacingValue } from '@/entities/style'

const LEGACY_PARAGRAPH_SPACING = 16

function hasImplicitParagraphMargin(value: string) {
  const paragraphs = value.match(/<p\b[^>]*>/gi) || []
  return paragraphs.some((tag) => {
    const style = tag.match(/\sstyle=(?:"([^"]*)"|'([^']*)')/i)
    return !/\bmargin(?:-(?:top|bottom))?\s*:/i.test(style?.[1] || style?.[2] || '')
  })
}

function hasZeroVerticalMargin(spacing?: SpacingValue) {
  return !spacing?.margin || (spacing.margin[0] === 0 && spacing.margin[2] === 0)
}

export function resolveLegacyTextBoxDefaults(atom: TextAtom) {
  const implicitParagraphMargin = hasImplicitParagraphMargin(atom.value)
  const paragraphSpacing = implicitParagraphMargin ? LEGACY_PARAGRAPH_SPACING : 0
  if (!implicitParagraphMargin || !hasZeroVerticalMargin(atom.spacing))
    return { paragraphSpacing }

  const margin = atom.spacing?.margin || [0, 0, 0, 0]
  return {
    paragraphSpacing,
    spacing: {
      ...atom.spacing,
      margin: [LEGACY_PARAGRAPH_SPACING, margin[1], LEGACY_PARAGRAPH_SPACING, margin[3]] as [
        number,
        number,
        number,
        number,
      ],
    },
  }
}
