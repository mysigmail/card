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

function buildMenu4ComposerBlock(theme: ComponentTheme, label: string): Block {
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

  const item = createItemNode({
    horizontalAlign: 'left',
    verticalAlign: 'top',
    atoms: [
      createImageAtomNode({
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

  grid.items = [item]
  block.grids = [grid]

  return block
}

export function menu4Composer(theme: ComponentTheme, label: string): BlockCatalogComponent {
  const preview = theme === 'dark' ? images.components.menu4.dark : images.components.menu4.light

  return {
    id: nanoid(8),
    version: 2,
    name: 'menu4-composer',
    label,
    type: 'menu',
    preview,
    block: buildMenu4ComposerBlock(theme, label),
  }
}
