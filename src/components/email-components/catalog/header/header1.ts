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

function buildHeader1ComposerBlock(label: string): Block {
  const block = createBlock(label)
  block.settings.spacing = {
    padding: [30, 35, 30, 35],
  }
  block.settings.backgroundColor = COLOR.theme.dark
  block.settings.backgroundImage = {
    url: '/img/josh-nuttall-pIwu5XNvXpk-unsplash.png',
    position: 'center',
    repeat: 'no-repeat',
    size: 'cover',
  }

  const topGrid = block.grids[0]
  resetGrid(topGrid)
  topGrid.items = [
    createItemNode({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      width: 35,
      atoms: [
        createImageAtomNode({
          src: images.logo.white,
          width: 110,
        }),
      ],
    }),
    createItemNode({
      horizontalAlign: 'right',
      verticalAlign: 'top',
      width: 65,
      atoms: [createMenuTextAtom(COLOR.theme.light, { gap: 10 })],
    }),
  ]

  const textGrid = createGrid([])
  resetGrid(textGrid)
  textGrid.items = [
    createItemNode({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [
        createTextAtomNode({
          value:
            '<p><strong><span style="font-size: 18px">Unleash Freedom</span></strong></p><p><span style="color: rgb(159, 249, 141); font-size: 48px">Discover</span><span style="font-size: 48px"> the Unmatched Thrill with Our </span><span style="color: #9FF98D; font-size: 48px">New Bicycle</span></p>',
          color: COLOR.theme.light,
          spacing: {
            margin: [50, 0, 0, 0],
            padding: [0, 0, 0, 0],
          },
        }),
      ],
    }),
  ]

  block.grids = [topGrid, textGrid]

  return block
}

export function header1Composer(_: ComponentTheme, label: string): BlockCatalogComponent {
  return {
    id: nanoid(8),
    version: 2,
    name: 'header1-composer',
    label,
    type: 'header',
    preview: images.components.header1,
    block: buildHeader1ComposerBlock(label),
  }
}
