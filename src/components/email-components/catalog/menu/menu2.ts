import type { BlockNode } from '@/types/block'
import type { BlockPreset, ComponentTheme } from '@/types/editor'
import { nanoid } from 'nanoid'
import { createBlockNode, createDividerAtom } from '@/components/email-components/block-factory'
import {
  buildImageAtom,
  createCell,
  createMenuTextAtom,
  resetRow,
} from '@/components/email-components/catalog/composer-helpers'
import { images } from '@/components/email-components/catalog/images'
import { COLOR } from '@/components/email-components/constants'

function buildMenu2Block(theme: ComponentTheme, label: string): BlockNode {
  const logo = theme === 'dark' ? images.logo.white : images.logo.black
  const backgroundColor = theme === 'dark' ? COLOR.theme.dark : COLOR.theme.light
  const linkColor = theme === 'dark' ? COLOR.theme.light : COLOR.theme.dark
  const dividerColor = theme === 'dark' ? COLOR.divider.light : COLOR.divider.dark

  const block = createBlockNode(label)
  block.settings.spacing = {
    padding: [30, 35, 30, 35],
  }
  block.settings.backgroundColor = backgroundColor
  block.settings.backgroundImage = undefined

  const row = block.rows[0]
  resetRow(row)

  const divider = createDividerAtom()
  divider.color = dividerColor
  divider.height = 1
  divider.spacing = {
    margin: [0, 0, 0, 0],
    padding: [10, 0, 10, 0],
  }

  const item = createCell({
    horizontalAlign: 'center',
    verticalAlign: 'top',
    atoms: [
      buildImageAtom({
        src: logo,
        width: 110,
      }),
      divider,
      createMenuTextAtom(linkColor, {
        gap: 10,
      }),
    ],
  })

  row.cells = [item]
  block.rows = [row]

  return block
}

export function menu2Preset(theme: ComponentTheme, label: string): BlockPreset {
  const preview = theme === 'dark' ? images.components.menu2.dark : images.components.menu2.light

  return {
    id: nanoid(8),
    version: 2,
    name: 'menu2',
    label,
    type: 'menu',
    preview,
    block: buildMenu2Block(theme, label),
  }
}
