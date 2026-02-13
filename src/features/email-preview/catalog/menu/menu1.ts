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

function buildMenu1Block(theme: ComponentTheme, label: string): BlockNode {
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

  const logoItem = createCell({
    horizontalAlign: 'left',
    verticalAlign: 'middle',
    atoms: [
      buildImageAtom({
        src: logo,
        width: 110,
      }),
    ],
  })

  const menuItem = createCell({
    horizontalAlign: 'right',
    verticalAlign: 'middle',
    atoms: [createMenuTextAtom(linkColor)],
  })

  row.cells = [logoItem, menuItem]
  block.rows = [row]

  return block
}

export function menu1Preset(theme: ComponentTheme, label: string): BlockPreset {
  const preview = theme === 'dark' ? images.components.menu1.dark : images.components.menu1.light

  return {
    id: nanoid(8),
    version: 2,
    name: 'menu1',
    label,
    type: 'menu',
    preview,
    block: buildMenu1Block(theme, label),
  }
}
