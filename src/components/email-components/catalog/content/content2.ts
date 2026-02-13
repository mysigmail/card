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

function buildContent2ComposerBlock(label: string): Block {
  const block = createBlock(label)
  block.settings.spacing = {
    padding: [30, 35, 30, 35],
  }
  block.settings.backgroundColor = '#FFFFFF'
  block.settings.backgroundImage = undefined

  const textGrid = block.grids[0]
  resetGrid(textGrid)
  textGrid.settings.gap = 20
  textGrid.settings.spacing = {
    padding: [0, 0, 12, 0],
  }
  textGrid.items = [
    createItemNode({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [
        createTextAtomNode({
          value:
            '<p style="text-align: left"><span style="color: rgb(159, 163, 167); font-size: 14px">12 July \'19</span></p><p style="text-align: left"><strong><span style="font-size: 24px">How Music Affects</span></strong><br><strong><span style="font-size: 24px">Your Productivity</span></strong></p>',
          color: '#111111',
        }),
      ],
    }),
    createItemNode({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [
        createTextAtomNode({
          value:
            '<p style="text-align: left"><span style="color: rgb(159, 163, 167); font-size: 14px">12 July \'19</span></p><p style="text-align: left"><strong><span style="font-size: 24px">Background Music for</span></strong><br><strong><span style="font-size: 24px">Coding</span></strong></p>',
          color: '#111111',
        }),
      ],
    }),
  ]

  const imageGrid = createGrid([])
  resetGrid(imageGrid)
  imageGrid.settings.gap = 20
  imageGrid.items = [
    createImageBlockItem('/img/juja-han-HU-uL54pfQI-unsplash.jpg', {
      height: 200,
      borderRadius: 5,
      link: 'https://example.com',
    }),
    createImageBlockItem('/img/jefferson-santos-9SoCnyQmkzI-unsplash.jpg', {
      height: 200,
      borderRadius: 5,
      link: 'https://example.com',
    }),
  ]

  block.grids = [textGrid, imageGrid]

  return block
}

export function content2Composer(_: ComponentTheme, label: string): BlockCatalogComponent {
  return {
    id: nanoid(8),
    version: 2,
    name: 'content2-composer',
    label,
    type: 'content',
    preview: images.components.content2,
    block: buildContent2ComposerBlock(label),
  }
}
