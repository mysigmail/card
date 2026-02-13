import type { BlockNode, TextAtom } from '@/types/block'
import type { BlockPreset, ComponentTheme } from '@/types/editor'
import { nanoid } from 'nanoid'
import { createBlockNode, createRowNode } from '@/components/email-components/block-factory'
import {
  buildImageAtom,
  buildTextAtom,
  createCell,
  resetRow,
} from '@/components/email-components/catalog/composer-helpers'
import { images } from '@/components/email-components/catalog/images'

function createTopTextAtom(value: string): TextAtom {
  return buildTextAtom({
    value: `<p style="text-align: center"><span style="color: rgb(159, 163, 167); font-size: 14px">${value}</span></p>`,
    color: '#111111',
  })
}

function createBottomTextAtom(name: string, role: string): TextAtom {
  return buildTextAtom({
    value: `<p style="text-align: center"><strong><span style="font-size: 18px">${name}</span></strong><br><span style="color: rgb(159, 163, 167); font-size: 14px">${role}</span></p>`,
    color: '#111111',
  })
}

function createProfileImageItem(src: string, name: string) {
  return createCell({
    horizontalAlign: 'center',
    verticalAlign: 'top',
    atoms: [
      buildImageAtom({
        src,
        alt: name,
        width: 80,
        height: 80,
        borderRadius: 60,
      }),
    ],
  })
}

function buildContent9Block(label: string): BlockNode {
  const block = createBlockNode(label)
  block.settings.spacing = {
    padding: [30, 35, 30, 35],
  }
  block.settings.backgroundColor = '#FFFFFF'
  block.settings.backgroundImage = undefined

  const rowOneRow = block.rows[0]
  resetRow(rowOneRow)
  rowOneRow.settings.gap = 20
  rowOneRow.settings.spacing = {
    padding: [0, 0, 8, 0],
  }
  rowOneRow.cells = [
    createCell({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [
        createTopTextAtom(
          'Staying in shape is mostly about program compliance: it&rsquo;s not about having the best fitness program, but about having one that&rsquo;s good enough, and making sure you actually stick to it.',
        ),
      ],
    }),
    createCell({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [
        createTopTextAtom(
          'There&rsquo;s a common saying that willpower is like a muscle: it gets stronger when you use it. The truth is more complex. There&rsquo;s mixed evidence for how much people can really improve their self-control.',
        ),
      ],
    }),
  ]

  const rowTwoRow = createRowNode([])
  resetRow(rowTwoRow)
  rowTwoRow.settings.gap = 20
  rowTwoRow.settings.spacing = {
    padding: [0, 0, 8, 0],
  }
  rowTwoRow.cells = [
    createProfileImageItem('/img/jack-finnigan-rriAI0nhcbc-unsplash.jpg', 'Mike Brown'),
    createProfileImageItem('/img/tamara-bellis-Mn1Uopx7if8-unsplash.jpg', 'Lina Muller'),
  ]

  const rowThreeRow = createRowNode([])
  resetRow(rowThreeRow)
  rowThreeRow.settings.gap = 20
  rowThreeRow.cells = [
    createCell({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [createBottomTextAtom('Mike Brown', 'Fitness Trainer')],
    }),
    createCell({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [createBottomTextAtom('Lina Muller', 'Bloger')],
    }),
  ]

  block.rows = [rowOneRow, rowTwoRow, rowThreeRow]

  return block
}

export function content9Preset(_: ComponentTheme, label: string): BlockPreset {
  return {
    id: nanoid(8),
    version: 2,
    name: 'content9',
    label,
    type: 'content',
    preview: images.components.content9,
    block: buildContent9Block(label),
  }
}
