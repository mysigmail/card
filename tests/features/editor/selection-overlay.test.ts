// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { resolveSelectionVisualTarget } from '@/features/editor/ui/use-selection-overlay'

describe('selection overlay target', () => {
  it.each(['block', 'row', 'cell'] as const)(
    'keeps the %s frame on the structural node when it contains an atom owner',
    (selectionLevel) => {
      const node = document.createElement('div')
      const atomOwner = document.createElement('img')
      atomOwner.dataset.selectionOwner = ''
      node.append(atomOwner)

      expect(resolveSelectionVisualTarget(node, selectionLevel)).toBe(node)
    },
  )

  it('uses the visual owner only for an atom frame', () => {
    const atom = document.createElement('div')
    const owner = document.createElement('img')
    owner.dataset.selectionOwner = ''
    atom.append(owner)

    expect(resolveSelectionVisualTarget(atom, 'atom')).toBe(owner)
  })

  it('falls back to the atom node when no visual owner exists', () => {
    const atom = document.createElement('div')

    expect(resolveSelectionVisualTarget(atom, 'atom')).toBe(atom)
  })
})
