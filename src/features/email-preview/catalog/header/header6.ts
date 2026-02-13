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

function buildHeader6Block(label: string): BlockNode {
  const block = createBlockNode(label)
  block.settings.spacing = {
    padding: [30, 35, 40, 35],
  }
  block.settings.backgroundColor = '#FFFFFF'
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
          alt: 'MySigMail',
          width: 128,
        }),
      ],
    }),
  ]

  const imageMainRow = createRowNode([])
  resetRow(imageMainRow)
  imageMainRow.settings.spacing = {
    margin: [0, 0, 0, 0],
    padding: [36, 0, 0, 0],
  }
  imageMainRow.cells = [
    createCell({
      horizontalAlign: 'center',
      verticalAlign: 'top',
      borderRadius: 0,
      atoms: [
        buildImageAtom({
          src: '/img/app-icon.png',
          alt: 'Image',
          width: 100,
          height: 100,
        }),
      ],
    }),
  ]

  const textMainRow = createRowNode([])
  resetRow(textMainRow)
  textMainRow.cells = [
    createCell({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [
        buildTextAtom({
          value:
            '<p style="text-align: center"><span style="color: rgb(124, 134, 199); font-size: 16px">Brand new</span></p><p style="text-align: center"><strong><span style="font-size: 32px">The Circle.</span></strong></p>',
          color: '#000000',
        }),
      ],
    }),
  ]

  const imageBlockRow = createRowNode([])
  resetRow(imageBlockRow)
  imageBlockRow.settings.spacing = {
    margin: [0, 0, 0, 0],
    padding: [24, 0, 0, 0],
  }
  imageBlockRow.cells = [
    createCell({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      borderRadius: 0,
      height: 185,
      link: 'https://example.com',
      backgroundImage: {
        url: '/img/iphone-angle.jpg',
        position: 'center',
        repeat: 'no-repeat',
        size: 'contain',
      },
      atoms: [],
    }),
  ]

  const textSecondaryRow = createRowNode([])
  resetRow(textSecondaryRow)
  textSecondaryRow.cells = [
    createCell({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [
        buildTextAtom({
          value:
            '<p style="text-align: center"><span style="font-size: 18px">GPS tracker for running and fitness.<br/>Unique features used by professional athletes<br/>are now also available for beginners!</span></p>',
          color: '#9FA3A7',
        }),
      ],
    }),
  ]

  const storesRow = createRowNode([])
  resetRow(storesRow)
  storesRow.settings.spacing = {
    margin: [0, 0, 0, 0],
    padding: [22, 0, 22, 0],
  }
  storesRow.settings.gap = 12
  storesRow.cells = [
    createCell({
      horizontalAlign: 'right',
      verticalAlign: 'top',
      atoms: [
        buildImageAtom({
          src: '/img/app-store.png',
          alt: 'Download on the App Store',
          width: 150,
        }),
      ],
    }),
    createCell({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [
        buildImageAtom({
          src: '/img/google-play.png',
          alt: 'Get it on Google Play',
          width: 150,
        }),
      ],
    }),
  ]

  block.rows = [logoRow, imageMainRow, textMainRow, imageBlockRow, textSecondaryRow, storesRow]

  return block
}

export function header6Preset(_: ComponentTheme, label: string): BlockPreset {
  return {
    id: nanoid(8),
    version: 2,
    name: 'header6',
    label,
    type: 'header',
    preview: images.components.header6,
    block: buildHeader6Block(label),
  }
}
