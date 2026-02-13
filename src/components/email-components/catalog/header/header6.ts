import type { Block } from '@/types/block'
import type { BlockCatalogComponent, ComponentTheme } from '@/types/editor'
import { nanoid } from 'nanoid'
import { createBlock, createGrid } from '@/components/email-components/block-factory'
import {
  createImageAtomNode,
  createItemNode,
  createTextAtomNode,
  resetGrid,
} from '@/components/email-components/catalog/composer-helpers'
import { images } from '@/components/email-components/catalog/images'

function buildHeader6ComposerBlock(label: string): Block {
  const block = createBlock(label)
  block.settings.spacing = {
    padding: [30, 35, 40, 35],
  }
  block.settings.backgroundColor = '#FFFFFF'
  block.settings.backgroundImage = undefined

  const logoGrid = block.grids[0]
  resetGrid(logoGrid)
  logoGrid.items = [
    createItemNode({
      horizontalAlign: 'center',
      verticalAlign: 'top',
      atoms: [
        createImageAtomNode({
          src: images.logo.black,
          alt: 'MySigMail',
          width: 128,
        }),
      ],
    }),
  ]

  const imageMainGrid = createGrid([])
  resetGrid(imageMainGrid)
  imageMainGrid.settings.spacing = {
    margin: [0, 0, 0, 0],
    padding: [36, 0, 0, 0],
  }
  imageMainGrid.items = [
    createItemNode({
      horizontalAlign: 'center',
      verticalAlign: 'top',
      borderRadius: 0,
      atoms: [
        createImageAtomNode({
          src: '/img/app-icon.png',
          alt: 'Image',
          width: 100,
          height: 100,
        }),
      ],
    }),
  ]

  const textMainGrid = createGrid([])
  resetGrid(textMainGrid)
  textMainGrid.items = [
    createItemNode({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [
        createTextAtomNode({
          value:
            '<p style="text-align: center"><span style="color: rgb(124, 134, 199); font-size: 16px">Brand new</span></p><p style="text-align: center"><strong><span style="font-size: 32px">The Circle.</span></strong></p>',
          color: '#000000',
        }),
      ],
    }),
  ]

  const imageBlockGrid = createGrid([])
  resetGrid(imageBlockGrid)
  imageBlockGrid.settings.spacing = {
    margin: [0, 0, 0, 0],
    padding: [24, 0, 0, 0],
  }
  imageBlockGrid.items = [
    createItemNode({
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

  const textSecondaryGrid = createGrid([])
  resetGrid(textSecondaryGrid)
  textSecondaryGrid.items = [
    createItemNode({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [
        createTextAtomNode({
          value:
            '<p style="text-align: center"><span style="font-size: 18px">GPS tracker for running and fitness.<br/>Unique features used by professional athletes<br/>are now also available for beginners!</span></p>',
          color: '#9FA3A7',
        }),
      ],
    }),
  ]

  const storesGrid = createGrid([])
  resetGrid(storesGrid)
  storesGrid.settings.spacing = {
    margin: [0, 0, 0, 0],
    padding: [22, 0, 22, 0],
  }
  storesGrid.settings.gap = 12
  storesGrid.items = [
    createItemNode({
      horizontalAlign: 'right',
      verticalAlign: 'top',
      atoms: [
        createImageAtomNode({
          src: '/img/app-store.png',
          alt: 'Download on the App Store',
          width: 150,
        }),
      ],
    }),
    createItemNode({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [
        createImageAtomNode({
          src: '/img/google-play.png',
          alt: 'Get it on Google Play',
          width: 150,
        }),
      ],
    }),
  ]

  block.grids = [
    logoGrid,
    imageMainGrid,
    textMainGrid,
    imageBlockGrid,
    textSecondaryGrid,
    storesGrid,
  ]

  return block
}

export function header6Composer(_: ComponentTheme, label: string): BlockCatalogComponent {
  return {
    id: nanoid(8),
    version: 2,
    name: 'header6-composer',
    label,
    type: 'header',
    preview: images.components.header6,
    block: buildHeader6ComposerBlock(label),
  }
}
