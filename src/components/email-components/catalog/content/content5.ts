import type { Block } from '@/types/block'
import type { BlockCatalogComponent, ComponentTheme } from '@/types/editor'
import { nanoid } from 'nanoid'
import { createBlock, createGrid } from '@/components/email-components/block-factory'
import {
  createImageAtomNode,
  createItemNode,
  createTextAtomNode,
  resetGrid,
} from '@/components/email-components/catalog/composer-helpers'
import { images } from '@/components/email-components/catalog/images'

function buildContent5ComposerBlock(label: string): Block {
  const block = createBlock(label)
  block.settings.spacing = {
    padding: [30, 35, 30, 35],
  }
  block.settings.backgroundColor = '#FFFFFF'
  block.settings.backgroundImage = undefined

  const introGrid = block.grids[0]
  resetGrid(introGrid)
  introGrid.items = [
    createItemNode({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [
        createTextAtomNode({
          value:
            '<p style="text-align: center"><span style="font-size: 14px">Staying in shape is mostly about program compliance: it&rsquo;s not about having</span><br><span style="font-size: 14px">the best fitness program, but about having one that&rsquo;s good enough, and</span><br><span style="font-size: 14px">making sure you actually stick to it.</span></p>',
          color: '#9FA3A7',
        }),
      ],
    }),
  ]

  const imageGrid = createGrid([])
  resetGrid(imageGrid)
  imageGrid.items = [
    createItemNode({
      horizontalAlign: 'center',
      verticalAlign: 'top',
      atoms: [
        createImageAtomNode({
          src: '/img/jack-finnigan-rriAI0nhcbc-unsplash.jpg',
          link: 'https://example.com',
          alt: 'Mike Brown',
          width: 80,
          height: 80,
          borderRadius: 60,
        }),
      ],
    }),
  ]

  const bottomTextGrid = createGrid([])
  resetGrid(bottomTextGrid)
  bottomTextGrid.items = [
    createItemNode({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [
        createTextAtomNode({
          value:
            '<p style="text-align: center"><strong><span style="font-size: 18px">Mike Brown</span></strong><br><span style="color: rgb(159, 163, 167); font-size: 14px">Fitness Trainer</span></p>',
          color: '#111111',
        }),
      ],
    }),
  ]

  block.grids = [introGrid, imageGrid, bottomTextGrid]

  return block
}

export function content5Composer(_: ComponentTheme, label: string): BlockCatalogComponent {
  return {
    id: nanoid(8),
    version: 2,
    name: 'content5-composer',
    label,
    type: 'content',
    preview: images.components.content5,
    block: buildContent5ComposerBlock(label),
  }
}
