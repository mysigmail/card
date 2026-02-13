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

function createLogoItem(src: string, alt: string, link: string) {
  return createCell({
    horizontalAlign: 'center',
    verticalAlign: 'top',
    atoms: [
      buildImageAtom({
        src,
        alt,
        link,
        width: 110,
      }),
    ],
  })
}

function buildContent6Block(label: string): BlockNode {
  const block = createBlockNode(label)
  block.settings.spacing = {
    padding: [30, 35, 30, 35],
  }
  block.settings.backgroundColor = '#222222'
  block.settings.backgroundImage = undefined

  const textRow = block.rows[0]
  resetRow(textRow)
  textRow.settings.spacing = {
    padding: [0, 0, 8, 0],
  }
  textRow.cells = [
    createCell({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [
        buildTextAtom({
          value:
            '<p style="text-align: center"><strong><span style="font-size: 32px">Our Clients</span></strong></p><p style="text-align: center"><span style="color: rgb(159, 163, 167); font-size: 16px">We&rsquo;re trusted by well-known companies,</span><br><span style="color: rgb(159, 163, 167); font-size: 14px">and here are some of them.</span></p>',
          color: '#FFFFFF',
        }),
      ],
    }),
  ]

  const rowOneRow = createRowNode([])
  resetRow(rowOneRow)
  rowOneRow.settings.gap = 6
  rowOneRow.settings.spacing = {
    padding: [0, 0, 10, 0],
  }
  rowOneRow.cells = [
    createLogoItem('/img/apple.png', 'Apple', 'https://www.apple.com'),
    createLogoItem('/img/google.png', 'Google', 'https://www.google.com'),
    createLogoItem('/img/xbox.png', 'Xbox', 'https://www.xbox.com'),
    createLogoItem('/img/spotify.png', 'Spotify', 'https://www.spotify.com'),
  ]

  const rowTwoRow = createRowNode([])
  resetRow(rowTwoRow)
  rowTwoRow.settings.gap = 6
  rowTwoRow.cells = [
    createLogoItem('/img/bose.png', 'Bose', 'https://www.bose.com'),
    createLogoItem('/img/microsoft.png', 'Microsoft', 'https://www.microsoft.com'),
    createLogoItem('/img/coca-cola.png', 'Coca-Cola', 'https://www.coca-cola.com'),
    createLogoItem('/img/facebook.png', 'Facebook', 'https://www.facebook.com'),
  ]

  block.rows = [textRow, rowOneRow, rowTwoRow]

  return block
}

export function content6Preset(_: ComponentTheme, label: string): BlockPreset {
  return {
    id: nanoid(8),
    version: 2,
    name: 'content6',
    label,
    type: 'content',
    preview: images.components.content6,
    block: buildContent6Block(label),
  }
}
