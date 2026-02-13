import type { BlockNode } from '@/entities/block'
import type { BlockPreset, ComponentTheme } from '@/features/editor'
import { nanoid } from 'nanoid'
import { createBlockNode, createRowNode } from '@/entities/block'
import {
  buildImageAtom,
  buildTextAtom,
  createCell,
  resetRow,
} from '@/features/email-preview/catalog/composer-helpers'
import { images } from '@/features/email-preview/catalog/images'

function buildContent5Block(label: string): BlockNode {
  const block = createBlockNode(label)
  block.settings.spacing = {
    padding: [30, 35, 30, 35],
  }
  block.settings.backgroundColor = '#FFFFFF'
  block.settings.backgroundImage = undefined

  const introRow = block.rows[0]
  resetRow(introRow)
  introRow.cells = [
    createCell({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [
        buildTextAtom({
          value:
            '<p style="text-align: center"><span style="font-size: 14px">Staying in shape is mostly about program compliance: it&rsquo;s not about having</span><br><span style="font-size: 14px">the best fitness program, but about having one that&rsquo;s good enough, and</span><br><span style="font-size: 14px">making sure you actually stick to it.</span></p>',
          color: '#9FA3A7',
        }),
      ],
    }),
  ]

  const imageRow = createRowNode([])
  resetRow(imageRow)
  imageRow.cells = [
    createCell({
      horizontalAlign: 'center',
      verticalAlign: 'top',
      atoms: [
        buildImageAtom({
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

  const bottomTextRow = createRowNode([])
  resetRow(bottomTextRow)
  bottomTextRow.cells = [
    createCell({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [
        buildTextAtom({
          value:
            '<p style="text-align: center"><strong><span style="font-size: 18px">Mike Brown</span></strong><br><span style="color: rgb(159, 163, 167); font-size: 14px">Fitness Trainer</span></p>',
          color: '#111111',
        }),
      ],
    }),
  ]

  block.rows = [introRow, imageRow, bottomTextRow]

  return block
}

export function content5Preset(_: ComponentTheme, label: string): BlockPreset {
  return {
    id: nanoid(8),
    version: 2,
    name: 'content5',
    label,
    type: 'content',
    preview: images.components.content5,
    block: buildContent5Block(label),
  }
}
