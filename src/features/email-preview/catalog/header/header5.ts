import type { BlockNode } from '@/entities/block'
import type { BlockPreset, ComponentTheme } from '@/features/editor'
import { nanoid } from 'nanoid'
import { createBlockNode, createRowNode } from '@/entities/block'
import {
  buildButtonAtom,
  buildImageAtom,
  buildTextAtom,
  createCell,
  resetRow,
} from '@/features/email-preview/catalog/composer-helpers'
import { images } from '@/features/email-preview/catalog/images'
import { COLOR } from '@/features/email-preview/constants'

function buildHeader5Block(label: string): BlockNode {
  const imageBlockHeight = 300

  const block = createBlockNode(label)
  block.settings.spacing = {
    padding: [30, 35, 30, 35],
  }
  block.settings.backgroundColor = COLOR.theme.light
  block.settings.backgroundImage = undefined

  const logoRow = block.rows[0]
  resetRow(logoRow)
  logoRow.cells = [
    createCell({
      horizontalAlign: 'center',
      verticalAlign: 'top',
      atoms: [
        buildImageAtom({
          src: images.logo.black,
          width: 110,
        }),
      ],
    }),
  ]

  const mainTextRow = createRowNode([])
  resetRow(mainTextRow)
  mainTextRow.settings.spacing = {
    margin: [0, 0, 0, 0],
    padding: [30, 0, 0, 0],
  }
  mainTextRow.cells = [
    createCell({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [
        buildTextAtom({
          value:
            '<p style="text-align: center"><span style="color: rgb(124, 134, 199); font-size: 18px">New series</span></p><p style="text-align: center"><strong><span style="font-size: 32px">The loop by loop.</span></strong></p>',
          color: '#000000',
        }),
      ],
    }),
  ]

  const imageBlockRow = createRowNode([])
  resetRow(imageBlockRow)
  imageBlockRow.settings.spacing = {
    margin: [0, 0, 0, 0],
    padding: [20, 0, 0, 0],
  }
  imageBlockRow.cells = [
    createCell({
      horizontalAlign: 'center',
      verticalAlign: 'top',
      borderRadius: 0,
      atoms: [
        buildImageAtom({
          src: '/img/apple-watch-2.png',
          width: 450,
          height: imageBlockHeight,
        }),
      ],
    }),
  ]

  const secondaryTextRow = createRowNode([])
  resetRow(secondaryTextRow)
  secondaryTextRow.settings.spacing = {
    margin: [0, 0, 0, 0],
    padding: [20, 0, 0, 0],
  }
  secondaryTextRow.cells = [
    createCell({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [
        buildTextAtom({
          value:
            '<p style="text-align: center"><span style="font-size: 18px">With our latest model of watch,<br>you\'ll get the most amazing features<br>for your everyday workout.</span></p>',
          color: '#A9ADB3',
        }),
      ],
    }),
  ]

  const buttonRow = createRowNode([])
  resetRow(buttonRow)
  buttonRow.cells = [
    createCell({
      horizontalAlign: 'center',
      verticalAlign: 'top',
      atoms: [
        buildButtonAtom({
          text: 'Take Yours',
          link: 'https://example.com',
          backgroundColor: '#4A98ED',
          color: COLOR.theme.light,
          fontSize: 14,
          borderRadius: 5,
          padding: [12, 24, 12, 24],
          spacing: {
            margin: [20, 0, 20, 0],
            padding: [12, 24, 12, 24],
          },
        }),
      ],
    }),
  ]

  block.rows = [logoRow, mainTextRow, imageBlockRow, secondaryTextRow, buttonRow]

  return block
}

export function header5Preset(_: ComponentTheme, label: string): BlockPreset {
  return {
    id: nanoid(8),
    version: 2,
    name: 'header5',
    label,
    type: 'header',
    preview: images.components.header5,
    block: buildHeader5Block(label),
  }
}
