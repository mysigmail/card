import type { Block, TextAtom } from '@/types/block'
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

function createArticleTextAtom(
  titleLine1: string,
  titleLine2: string,
  description: string,
): TextAtom {
  return createTextAtomNode({
    value: `<p style="text-align: left"><span style="color: rgb(159, 163, 167); font-size: 14px">12 July '19</span></p><p style="text-align: left"><strong><span style="font-size: 24px">${titleLine1}</span></strong><br><strong><span style="font-size: 24px">${titleLine2}</span></strong></p><p style="text-align: left"><span style="color: rgb(159, 163, 167); font-size: 14px">${description}</span></p>`,
    color: '#111111',
  })
}

function buildContent3ComposerBlock(label: string): Block {
  const block = createBlock(label)
  block.settings.spacing = {
    padding: [30, 35, 30, 35],
  }
  block.settings.backgroundColor = '#FFFFFF'
  block.settings.backgroundImage = undefined

  const rowOneGrid = block.grids[0]
  resetGrid(rowOneGrid)
  rowOneGrid.settings.gap = 20
  rowOneGrid.settings.spacing = {
    padding: [0, 0, 20, 0],
  }
  rowOneGrid.items = [
    createImageBlockItem('/img/juja-han-HU-uL54pfQI-unsplash.jpg', {
      height: 200,
      borderRadius: 5,
      link: 'https://example.com',
    }),
    createItemNode({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [
        createArticleTextAtom(
          'How Music Affects',
          'Your Productivity',
          'Music is regarded as one of the triumphs of human creativity.',
        ),
      ],
    }),
  ]

  const rowTwoGrid = createGrid([])
  resetGrid(rowTwoGrid)
  rowTwoGrid.settings.gap = 20
  rowTwoGrid.items = [
    createImageBlockItem('/img/jefferson-santos-9SoCnyQmkzI-unsplash.jpg', {
      height: 200,
      borderRadius: 5,
      link: 'https://example.com',
    }),
    createItemNode({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [
        createArticleTextAtom(
          'Background Music for',
          'Coding',
          'Do you guys use background music while coding?',
        ),
      ],
    }),
  ]

  block.grids = [rowOneGrid, rowTwoGrid]

  return block
}

export function content3Composer(_: ComponentTheme, label: string): BlockCatalogComponent {
  return {
    id: nanoid(8),
    version: 2,
    name: 'content3-composer',
    label,
    type: 'content',
    preview: images.components.content3,
    block: buildContent3ComposerBlock(label),
  }
}
