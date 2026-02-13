import type { Block, TextAtom } from '@/types/block'
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

function createTopTextAtom(value: string): TextAtom {
  return createTextAtomNode({
    value: `<p style="text-align: center"><span style="color: rgb(159, 163, 167); font-size: 14px">${value}</span></p>`,
    color: '#111111',
  })
}

function createBottomTextAtom(name: string, role: string): TextAtom {
  return createTextAtomNode({
    value: `<p style="text-align: center"><strong><span style="font-size: 18px">${name}</span></strong><br><span style="color: rgb(159, 163, 167); font-size: 14px">${role}</span></p>`,
    color: '#111111',
  })
}

function createProfileImageItem(src: string, name: string) {
  return createItemNode({
    horizontalAlign: 'center',
    verticalAlign: 'top',
    atoms: [
      createImageAtomNode({
        src,
        alt: name,
        width: 80,
        height: 80,
        borderRadius: 60,
      }),
    ],
  })
}

function buildContent9ComposerBlock(label: string): Block {
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
    padding: [0, 0, 8, 0],
  }
  rowOneGrid.items = [
    createItemNode({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [
        createTopTextAtom(
          'Staying in shape is mostly about program compliance: it&rsquo;s not about having the best fitness program, but about having one that&rsquo;s good enough, and making sure you actually stick to it.',
        ),
      ],
    }),
    createItemNode({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [
        createTopTextAtom(
          'There&rsquo;s a common saying that willpower is like a muscle: it gets stronger when you use it. The truth is more complex. There&rsquo;s mixed evidence for how much people can really improve their self-control.',
        ),
      ],
    }),
  ]

  const rowTwoGrid = createGrid([])
  resetGrid(rowTwoGrid)
  rowTwoGrid.settings.gap = 20
  rowTwoGrid.settings.spacing = {
    padding: [0, 0, 8, 0],
  }
  rowTwoGrid.items = [
    createProfileImageItem('/img/jack-finnigan-rriAI0nhcbc-unsplash.jpg', 'Mike Brown'),
    createProfileImageItem('/img/tamara-bellis-Mn1Uopx7if8-unsplash.jpg', 'Lina Muller'),
  ]

  const rowThreeGrid = createGrid([])
  resetGrid(rowThreeGrid)
  rowThreeGrid.settings.gap = 20
  rowThreeGrid.items = [
    createItemNode({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [createBottomTextAtom('Mike Brown', 'Fitness Trainer')],
    }),
    createItemNode({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [createBottomTextAtom('Lina Muller', 'Bloger')],
    }),
  ]

  block.grids = [rowOneGrid, rowTwoGrid, rowThreeGrid]

  return block
}

export function content9Composer(_: ComponentTheme, label: string): BlockCatalogComponent {
  return {
    id: nanoid(8),
    version: 2,
    name: 'content9-composer',
    label,
    type: 'content',
    preview: images.components.content9,
    block: buildContent9ComposerBlock(label),
  }
}
