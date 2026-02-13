import type { BlockNode } from '@/entities/block'
import type { BlockPreset, ComponentTheme } from '@/features/editor'
import { nanoid } from 'nanoid'
import { createBlockNode } from '@/entities/block'
import {
  buildImageAtom,
  createCell,
  createMenuTextAtom,
  resetRow,
} from '@/features/email-preview/catalog/composer-helpers'
import { images } from '@/features/email-preview/catalog/images'
import { COLOR } from '@/features/email-preview/constants'

function buildMenu4Block(theme: ComponentTheme, label: string): BlockNode {
  const logo = theme === 'dark' ? images.logo.white : images.logo.black
  const backgroundColor = theme === 'dark' ? COLOR.theme.dark : COLOR.theme.light
  const linkColor = theme === 'dark' ? COLOR.theme.light : COLOR.theme.dark

  const block = createBlockNode(label)
  block.settings.spacing = {
    padding: [30, 35, 30, 35],
  }
  block.settings.backgroundColor = backgroundColor
  block.settings.backgroundImage = undefined

  const row = block.rows[0]
  resetRow(row)

  const item = createCell({
    horizontalAlign: 'left',
    verticalAlign: 'top',
    atoms: [
      buildImageAtom({
        src: logo,
        width: 110,
      }),
      createMenuTextAtom(linkColor, {
        gap: 10,
        spacing: {
          margin: [0, 0, 0, 0],
          padding: [20, 0, 0, 0],
        },
      }),
    ],
  })

  row.cells = [item]
  block.rows = [row]

  return block
}

export function menu4Preset(theme: ComponentTheme, label: string): BlockPreset {
  const preview = theme === 'dark' ? images.components.menu4.dark : images.components.menu4.light

  return {
    id: nanoid(8),
    version: 2,
    name: 'menu4',
    label,
    type: 'menu',
    preview,
    block: buildMenu4Block(theme, label),
  }
}
