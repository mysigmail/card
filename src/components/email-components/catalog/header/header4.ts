import type { BlockNode } from '@/types/block'
import type { BlockPreset, ComponentTheme } from '@/types/editor'
import { nanoid } from 'nanoid'
import { createBlockNode, createRowNode } from '@/components/email-components/block-factory'
import {
  buildButtonAtom,
  buildImageAtom,
  buildTextAtom,
  createCell,
  createImageBackgroundCell,
  resetRow,
} from '@/components/email-components/catalog/composer-helpers'
import { images } from '@/components/email-components/catalog/images'
import { COLOR } from '@/components/email-components/constants'

function buildHeader4Block(label: string): BlockNode {
  const imageMainHeight = 296

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

  const imageRow = createRowNode([])
  resetRow(imageRow)
  imageRow.settings.spacing = {
    margin: [0, 0, 0, 0],
    padding: [20, 0, 0, 0],
  }
  imageRow.cells = [
    createImageBackgroundCell('/img/johannes-andersson-v5gGwubKzEA-unsplash.jpg', {
      height: imageMainHeight,
      borderRadius: 5,
      link: 'https://example.com',
    }),
  ]

  const textRow = createRowNode([])
  resetRow(textRow)
  textRow.settings.spacing = {
    margin: [0, 0, 0, 0],
    padding: [10, 0, 0, 0],
  }
  textRow.cells = [
    createCell({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [
        buildTextAtom({
          value:
            '<p style="text-align: center"><span style="font-size: 18px; color: #9CA3AF">Surfing Season \'19</span></p><p style="text-align: center"><span style="font-size: 32px"><strong>There\'s Change<br/>In The Air.<br/>Can You Feel It?</strong></span></p>',
          color: COLOR.theme.dark,
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
          text: 'Take Part',
          link: 'https://example.com',
          backgroundColor: '#4A98ED',
          color: COLOR.theme.light,
          fontSize: 14,
          borderRadius: 5,
          padding: [12, 24, 12, 24],
          spacing: {
            margin: [20, 0, 0, 0],
            padding: [12, 24, 12, 24],
          },
        }),
      ],
    }),
  ]

  block.rows = [logoRow, imageRow, textRow, buttonRow]

  return block
}

export function header4Preset(_: ComponentTheme, label: string): BlockPreset {
  return {
    id: nanoid(8),
    version: 2,
    name: 'header4',
    label,
    type: 'header',
    preview: images.components.header4,
    block: buildHeader4Block(label),
  }
}
