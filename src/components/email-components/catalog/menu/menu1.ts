import type { Block } from '@/types/block'
import type { BlockCatalogComponent, ComponentTheme } from '@/types/editor'
import { nanoid } from 'nanoid'
import { createBlock } from '@/components/email-components/block-factory'
import {
  createImageAtomNode,
  createItemNode,
  createMenuTextAtom,
  resetGrid,
} from '@/components/email-components/catalog/composer-helpers'
import { images } from '@/components/email-components/catalog/images'
import { COLOR } from '@/components/email-components/constants'

function buildMenu1ComposerBlock(theme: ComponentTheme, label: string): Block {
  const logo = theme === 'dark' ? images.logo.white : images.logo.black
  const backgroundColor = theme === 'dark' ? COLOR.theme.dark : COLOR.theme.light
  const linkColor = theme === 'dark' ? COLOR.theme.light : COLOR.theme.dark

  const block = createBlock(label)
  block.settings.spacing = {
    padding: [30, 35, 30, 35],
  }
  block.settings.backgroundColor = backgroundColor
  block.settings.backgroundImage = undefined

  const grid = block.grids[0]
  resetGrid(grid)

  const logoItem = createItemNode({
    horizontalAlign: 'left',
    verticalAlign: 'middle',
    atoms: [
      createImageAtomNode({
        src: logo,
        width: 110,
      }),
    ],
  })

  const menuItem = createItemNode({
    horizontalAlign: 'right',
    verticalAlign: 'middle',
    atoms: [createMenuTextAtom(linkColor)],
  })

  grid.items = [logoItem, menuItem]
  block.grids = [grid]

  return block
}

export function menu1Composer(theme: ComponentTheme, label: string): BlockCatalogComponent {
  const preview = theme === 'dark' ? images.components.menu1.dark : images.components.menu1.light

  return {
    id: nanoid(8),
    version: 2,
    name: 'menu1-composer',
    label,
    type: 'menu',
    preview,
    block: buildMenu1ComposerBlock(theme, label),
  }
}
