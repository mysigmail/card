import type { BlockNode } from '@/types/block'
import type { BlockPreset, ComponentTheme } from '@/types/editor'
import { nanoid } from 'nanoid'
import { createBlockNode, createRowNode } from '@/components/email-components/block-factory'
import {
  buildButtonAtom,
  buildImageAtom,
  buildTextAtom,
  createCell,
  resetRow,
} from '@/components/email-components/catalog/composer-helpers'
import { images } from '@/components/email-components/catalog/images'
import { COLOR } from '@/components/email-components/constants'

function buildHeader3Block(label: string): BlockNode {
  const block = createBlockNode(label)
  block.settings.spacing = {
    padding: [30, 35, 30, 35],
  }
  block.settings.backgroundColor = COLOR.theme.light
  block.settings.backgroundImage = undefined

  const topRow = block.rows[0]
  resetRow(topRow)
  topRow.cells = [
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

  const contentRow = createRowNode([])
  resetRow(contentRow)
  contentRow.settings.spacing = {
    margin: [0, 0, 0, 0],
    padding: [30, 0, 0, 0],
  }
  contentRow.cells = [
    createCell({
      horizontalAlign: 'center',
      verticalAlign: 'top',
      borderRadius: 5,
      backgroundImage: {
        url: '/img/bosco-shots-ZoEdO0G0xmI-unsplash.png',
        position: 'top',
        repeat: 'no-repeat',
        size: 'cover',
      },
      spacing: {
        margin: [0, 0, 0, 0],
        padding: [45, 20, 16, 20],
      },
      atoms: [
        buildTextAtom({
          value:
            '<p style="text-align: center"><span style="font-size: 36px"><strong>Don\'t Lose<br/>Yourself.</strong></span></p><p style="text-align: center"><span style="font-size: 18px">New album</span></p>',
          color: COLOR.theme.light,
        }),
        buildButtonAtom({
          text: 'Download',
          link: 'https://example.com',
          backgroundColor: '#3494FB',
          color: COLOR.theme.light,
          fontSize: 14,
          borderRadius: 5,
          padding: [12, 24, 12, 24],
          spacing: {
            margin: [40, 0, 40, 0],
            padding: [12, 24, 12, 24],
          },
        }),
      ],
    }),
  ]

  block.rows = [topRow, contentRow]

  return block
}

export function header3Preset(_: ComponentTheme, label: string): BlockPreset {
  return {
    id: nanoid(8),
    version: 2,
    name: 'header3',
    label,
    type: 'header',
    preview: images.components.header3,
    block: buildHeader3Block(label),
  }
}
