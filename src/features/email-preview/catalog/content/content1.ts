import type { BlockNode } from '@/entities/block'
import type { BlockPreset, ComponentTheme } from '@/features/editor'
import { nanoid } from 'nanoid'
import { createBlockNode, createRowNode } from '@/entities/block'
import {
  buildTextAtom,
  createCell,
  createImageBackgroundCell,
  resetRow,
} from '@/features/email-preview/catalog/composer-helpers'
import { images } from '@/features/email-preview/catalog/images'

function buildContent1Block(label: string): BlockNode {
  const block = createBlockNode(label)
  block.settings.spacing = {
    padding: [30, 35, 30, 35],
  }
  block.settings.backgroundColor = '#FFFFFF'
  block.settings.backgroundImage = undefined

  const textRow = block.rows[0]
  resetRow(textRow)
  textRow.cells = [
    createCell({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [
        buildTextAtom({
          value:
            '<p style="text-align: center"><span style="color: rgb(159, 163, 167); font-size: 14px">12 July \'19</span></p><p style="text-align: center"><strong><span style="font-size: 24px">Is There a Perfect Time of</span></strong><br><strong><span style="font-size: 24px">Day to Meditate?</span></strong></p>',
          color: '#111111',
        }),
      ],
    }),
  ]

  const imageRow = createRowNode([])
  resetRow(imageRow)
  imageRow.cells = [
    createImageBackgroundCell('/img/simon-migaj-Yui5vfKHuzs-unsplash.jpg', {
      height: 200,
      borderRadius: 5,
      link: 'https://example.com',
    }),
  ]

  block.rows = [textRow, imageRow]

  return block
}

export function content1Preset(_: ComponentTheme, label: string): BlockPreset {
  return {
    id: nanoid(8),
    version: 2,
    name: 'content1',
    label,
    type: 'content',
    preview: images.components.content1,
    block: buildContent1Block(label),
  }
}
