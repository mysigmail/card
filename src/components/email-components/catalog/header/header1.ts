import type { BlockNode } from '@/types/block'
import type { BlockPreset, ComponentTheme } from '@/types/editor'
import { nanoid } from 'nanoid'
import { createBlockNode, createRowNode } from '@/components/email-components/block-factory'
import {
  buildImageAtom,
  buildTextAtom,
  createCell,
  createMenuTextAtom,
  resetRow,
} from '@/components/email-components/catalog/composer-helpers'
import { images } from '@/components/email-components/catalog/images'
import { COLOR } from '@/components/email-components/constants'

function buildHeader1Block(label: string): BlockNode {
  const block = createBlockNode(label)
  block.settings.spacing = {
    padding: [30, 35, 30, 35],
  }
  block.settings.backgroundColor = COLOR.theme.dark
  block.settings.backgroundImage = {
    url: '/img/josh-nuttall-pIwu5XNvXpk-unsplash.png',
    position: 'center',
    repeat: 'no-repeat',
    size: 'cover',
  }

  const topRow = block.rows[0]
  resetRow(topRow)
  topRow.cells = [
    createCell({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      width: 35,
      atoms: [
        buildImageAtom({
          src: images.logo.white,
          width: 110,
        }),
      ],
    }),
    createCell({
      horizontalAlign: 'right',
      verticalAlign: 'top',
      width: 65,
      atoms: [createMenuTextAtom(COLOR.theme.light, { gap: 10 })],
    }),
  ]

  const textRow = createRowNode([])
  resetRow(textRow)
  textRow.cells = [
    createCell({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [
        buildTextAtom({
          value:
            '<p><strong><span style="font-size: 18px">Unleash Freedom</span></strong></p><p><span style="color: rgb(159, 249, 141); font-size: 48px">Discover</span><span style="font-size: 48px"> the Unmatched Thrill with Our </span><span style="color: #9FF98D; font-size: 48px">New Bicycle</span></p>',
          color: COLOR.theme.light,
          spacing: {
            margin: [50, 0, 0, 0],
            padding: [0, 0, 0, 0],
          },
        }),
      ],
    }),
  ]

  block.rows = [topRow, textRow]

  return block
}

export function header1Preset(_: ComponentTheme, label: string): BlockPreset {
  return {
    id: nanoid(8),
    version: 2,
    name: 'header1',
    label,
    type: 'header',
    preview: images.components.header1,
    block: buildHeader1Block(label),
  }
}
