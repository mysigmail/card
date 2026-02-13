import type { Block } from '@/types/block'
import type { BlockCatalogComponent, ComponentTheme } from '@/types/editor'
import { nanoid } from 'nanoid'
import { createBlock, createDividerAtom } from '@/components/email-components/block-factory'
import {
  createImageAtomNode,
  createItemNode,
  createMenuTextAtom,
  resetGrid,
} from '@/components/email-components/catalog/composer-helpers'
import { images } from '@/components/email-components/catalog/images'
import { COLOR } from '@/components/email-components/constants'

function buildMenu2ComposerBlock(theme: ComponentTheme, label: string): Block {
  const logo = theme === 'dark' ? images.logo.white : images.logo.black
  const backgroundColor = theme === 'dark' ? COLOR.theme.dark : COLOR.theme.light
  const linkColor = theme === 'dark' ? COLOR.theme.light : COLOR.theme.dark
  const dividerColor = theme === 'dark' ? COLOR.divider.light : COLOR.divider.dark

  const block = createBlock(label)
  block.settings.spacing = {
    padding: [30, 35, 30, 35],
  }
  block.settings.backgroundColor = backgroundColor
  block.settings.backgroundImage = undefined

  const grid = block.grids[0]
  resetGrid(grid)

  const divider = createDividerAtom()
  divider.color = dividerColor
  divider.height = 1
  divider.spacing = {
    margin: [0, 0, 0, 0],
    padding: [10, 0, 10, 0],
  }

  const item = createItemNode({
    horizontalAlign: 'center',
    verticalAlign: 'top',
    atoms: [
      createImageAtomNode({
        src: logo,
        width: 110,
      }),
      divider,
      createMenuTextAtom(linkColor, {
        gap: 10,
      }),
    ],
  })

  grid.items = [item]
  block.grids = [grid]

  return block
}

export function menu2Composer(theme: ComponentTheme, label: string): BlockCatalogComponent {
  const preview = theme === 'dark' ? images.components.menu2.dark : images.components.menu2.light

  return {
    id: nanoid(8),
    version: 2,
    name: 'menu2-composer',
    label,
    type: 'menu',
    preview,
    block: buildMenu2ComposerBlock(theme, label),
  }
}
