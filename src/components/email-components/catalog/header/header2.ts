import type { Block } from '@/types/block'
import type { BlockCatalogComponent, ComponentTheme } from '@/types/editor'
import { nanoid } from 'nanoid'
import { createBlock, createGrid } from '@/components/email-components/block-factory'
import {
  createImageAtomNode,
  createItemNode,
  createMenuTextAtom,
  createTextAtomNode,
  resetGrid,
} from '@/components/email-components/catalog/composer-helpers'
import { images } from '@/components/email-components/catalog/images'
import { COLOR } from '@/components/email-components/constants'

function buildHeader2ComposerBlock(label: string): Block {
  const block = createBlock(label)
  block.settings.spacing = {
    padding: [30, 35, 30, 35],
  }
  block.settings.backgroundColor = COLOR.theme.light
  block.settings.backgroundImage = undefined

  const topGrid = block.grids[0]
  resetGrid(topGrid)
  topGrid.settings.spacing = {
    margin: [0, 0, 0, 0],
    padding: [0, 0, 20, 0],
  }
  topGrid.items = [
    createItemNode({
      horizontalAlign: 'left',
      verticalAlign: 'middle',
      atoms: [
        createImageAtomNode({
          src: images.logo.black,
          width: 110,
        }),
      ],
    }),
    createItemNode({
      horizontalAlign: 'right',
      verticalAlign: 'middle',
      atoms: [createMenuTextAtom(COLOR.theme.dark, { gap: 10 })],
    }),
  ]

  const textGrid = createGrid([])
  resetGrid(textGrid)
  textGrid.items = [
    createItemNode({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      borderRadius: 5,
      backgroundImage: {
        url: '/img/ruslan-bardash-4kTbAMRAHtQ-unsplash.png',
        position: 'top',
        repeat: 'no-repeat',
        size: 'cover',
      },
      spacing: {
        margin: [0, 0, 0, 0],
        padding: [140, 20, 20, 20],
      },
      atoms: [
        createTextAtomNode({
          value:
            '<p style="text-align: center"><span style="font-size: 18px">New Stool</span></p><p style="text-align: center"><span style="font-size: 36px"><u>Simplicity. Practicality. Naturality</u></span></p>',
          color: COLOR.theme.light,
        }),
      ],
    }),
  ]

  block.grids = [topGrid, textGrid]

  return block
}

export function header2Composer(_: ComponentTheme, label: string): BlockCatalogComponent {
  return {
    id: nanoid(8),
    version: 2,
    name: 'header2-composer',
    label,
    type: 'header',
    preview: images.components.header2,
    block: buildHeader2ComposerBlock(label),
  }
}
