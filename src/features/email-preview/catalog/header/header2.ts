import type { BlockNode } from '@/entities/block'
import type { BlockPreset, ComponentTheme } from '@/features/editor'
import { nanoid } from 'nanoid'
import { createBlockNode, createRowNode } from '@/entities/block'
import {
  buildImageAtom,
  buildTextAtom,
  createCell,
  createMenuTextAtom,
  resetRow,
} from '@/features/email-preview/catalog/composer-helpers'
import { images } from '@/features/email-preview/catalog/images'
import { COLOR } from '@/features/email-preview/constants'

function buildHeader2Block(label: string): BlockNode {
  const block = createBlockNode(label)
  block.settings.spacing = {
    padding: [30, 35, 30, 35],
  }
  block.settings.backgroundColor = COLOR.theme.light
  block.settings.backgroundImage = undefined

  const topRow = block.rows[0]
  resetRow(topRow)
  topRow.settings.spacing = {
    margin: [0, 0, 0, 0],
    padding: [0, 0, 20, 0],
  }
  topRow.cells = [
    createCell({
      horizontalAlign: 'left',
      verticalAlign: 'middle',
      atoms: [
        buildImageAtom({
          src: images.logo.black,
          width: 110,
        }),
      ],
    }),
    createCell({
      horizontalAlign: 'right',
      verticalAlign: 'middle',
      atoms: [createMenuTextAtom(COLOR.theme.dark, { gap: 10 })],
    }),
  ]

  const textRow = createRowNode([])
  resetRow(textRow)
  textRow.cells = [
    createCell({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      borderRadius: 5,
      backgroundImage: {
        url: '/img/ruslan-bardash-4kTbAMRAHtQ-unsplash.png',
        position: 'top',
        repeat: 'no-repeat',
        size: 'cover',
      },
      spacing: {
        margin: [0, 0, 0, 0],
        padding: [140, 20, 20, 20],
      },
      atoms: [
        buildTextAtom({
          value:
            '<p style="text-align: center"><span style="font-size: 18px">New Stool</span></p><p style="text-align: center"><span style="font-size: 36px"><u>Simplicity. Practicality. Naturality</u></span></p>',
          color: COLOR.theme.light,
        }),
      ],
    }),
  ]

  block.rows = [topRow, textRow]

  return block
}

export function header2Preset(_: ComponentTheme, label: string): BlockPreset {
  return {
    id: nanoid(8),
    version: 2,
    name: 'header2',
    label,
    type: 'header',
    preview: images.components.header2,
    block: buildHeader2Block(label),
  }
}
