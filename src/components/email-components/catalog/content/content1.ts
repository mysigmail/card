import type { Block } from '@/types/block'
import type { BlockCatalogComponent, ComponentTheme } from '@/types/editor'
import { nanoid } from 'nanoid'
import { createBlock, createGrid } from '@/components/email-components/block-factory'
import {
  createImageBlockItem,
  createItemNode,
  createTextAtomNode,
  resetGrid,
} from '@/components/email-components/catalog/composer-helpers'
import { images } from '@/components/email-components/catalog/images'

function buildContent1ComposerBlock(label: string): Block {
  const block = createBlock(label)
  block.settings.spacing = {
    padding: [30, 35, 30, 35],
  }
  block.settings.backgroundColor = '#FFFFFF'
  block.settings.backgroundImage = undefined

  const textGrid = block.grids[0]
  resetGrid(textGrid)
  textGrid.items = [
    createItemNode({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [
        createTextAtomNode({
          value:
            '<p style="text-align: center"><span style="color: rgb(159, 163, 167); font-size: 14px">12 July \'19</span></p><p style="text-align: center"><strong><span style="font-size: 24px">Is There a Perfect Time of</span></strong><br><strong><span style="font-size: 24px">Day to Meditate?</span></strong></p>',
          color: '#111111',
        }),
      ],
    }),
  ]

  const imageGrid = createGrid([])
  resetGrid(imageGrid)
  imageGrid.items = [
    createImageBlockItem('/img/simon-migaj-Yui5vfKHuzs-unsplash.jpg', {
      height: 200,
      borderRadius: 5,
      link: 'https://example.com',
    }),
  ]

  block.grids = [textGrid, imageGrid]

  return block
}

export function content1Composer(_: ComponentTheme, label: string): BlockCatalogComponent {
  return {
    id: nanoid(8),
    version: 2,
    name: 'content1-composer',
    label,
    type: 'content',
    preview: images.components.content1,
    block: buildContent1ComposerBlock(label),
  }
}
