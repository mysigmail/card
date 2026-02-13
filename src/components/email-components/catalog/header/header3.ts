import type { Block } from '@/types/block'
import type { BlockCatalogComponent, ComponentTheme } from '@/types/editor'
import { nanoid } from 'nanoid'
import { createBlock, createGrid } from '@/components/email-components/block-factory'
import {
  createButtonAtomNode,
  createImageAtomNode,
  createItemNode,
  createTextAtomNode,
  resetGrid,
} from '@/components/email-components/catalog/composer-helpers'
import { images } from '@/components/email-components/catalog/images'
import { COLOR } from '@/components/email-components/constants'

function buildHeader3ComposerBlock(label: string): Block {
  const block = createBlock(label)
  block.settings.spacing = {
    padding: [30, 35, 30, 35],
  }
  block.settings.backgroundColor = COLOR.theme.light
  block.settings.backgroundImage = undefined

  const topGrid = block.grids[0]
  resetGrid(topGrid)
  topGrid.items = [
    createItemNode({
      horizontalAlign: 'center',
      verticalAlign: 'top',
      atoms: [
        createImageAtomNode({
          src: images.logo.black,
          width: 110,
        }),
      ],
    }),
  ]

  const contentGrid = createGrid([])
  resetGrid(contentGrid)
  contentGrid.settings.spacing = {
    margin: [0, 0, 0, 0],
    padding: [30, 0, 0, 0],
  }
  contentGrid.items = [
    createItemNode({
      horizontalAlign: 'center',
      verticalAlign: 'top',
      borderRadius: 5,
      backgroundImage: {
        url: '/img/bosco-shots-ZoEdO0G0xmI-unsplash.png',
        position: 'top',
        repeat: 'no-repeat',
        size: 'cover',
      },
      spacing: {
        margin: [0, 0, 0, 0],
        padding: [45, 20, 16, 20],
      },
      atoms: [
        createTextAtomNode({
          value:
            '<p style="text-align: center"><span style="font-size: 36px"><strong>Don\'t Lose<br/>Yourself.</strong></span></p><p style="text-align: center"><span style="font-size: 18px">New album</span></p>',
          color: COLOR.theme.light,
        }),
        createButtonAtomNode({
          text: 'Download',
          link: 'https://example.com',
          backgroundColor: '#3494FB',
          color: COLOR.theme.light,
          fontSize: 14,
          borderRadius: 5,
          padding: [12, 24, 12, 24],
          spacing: {
            margin: [40, 0, 40, 0],
            padding: [12, 24, 12, 24],
          },
        }),
      ],
    }),
  ]

  block.grids = [topGrid, contentGrid]

  return block
}

export function header3Composer(_: ComponentTheme, label: string): BlockCatalogComponent {
  return {
    id: nanoid(8),
    version: 2,
    name: 'header3-composer',
    label,
    type: 'header',
    preview: images.components.header3,
    block: buildHeader3ComposerBlock(label),
  }
}
