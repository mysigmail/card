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

function createLogoItem(src: string, alt: string, link: string) {
  return createItemNode({
    horizontalAlign: 'center',
    verticalAlign: 'top',
    atoms: [
      createImageAtomNode({
        src,
        alt,
        link,
        width: 110,
      }),
    ],
  })
}

function buildContent6ComposerBlock(label: string): Block {
  const block = createBlock(label)
  block.settings.spacing = {
    padding: [30, 35, 30, 35],
  }
  block.settings.backgroundColor = '#222222'
  block.settings.backgroundImage = undefined

  const textGrid = block.grids[0]
  resetGrid(textGrid)
  textGrid.settings.spacing = {
    padding: [0, 0, 8, 0],
  }
  textGrid.items = [
    createItemNode({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [
        createTextAtomNode({
          value:
            '<p style="text-align: center"><strong><span style="font-size: 32px">Our Clients</span></strong></p><p style="text-align: center"><span style="color: rgb(159, 163, 167); font-size: 16px">We&rsquo;re trusted by well-known companies,</span><br><span style="color: rgb(159, 163, 167); font-size: 14px">and here are some of them.</span></p>',
          color: '#FFFFFF',
        }),
      ],
    }),
  ]

  const rowOneGrid = createGrid([])
  resetGrid(rowOneGrid)
  rowOneGrid.settings.gap = 6
  rowOneGrid.settings.spacing = {
    padding: [0, 0, 10, 0],
  }
  rowOneGrid.items = [
    createLogoItem('/img/apple.png', 'Apple', 'https://www.apple.com'),
    createLogoItem('/img/google.png', 'Google', 'https://www.google.com'),
    createLogoItem('/img/xbox.png', 'Xbox', 'https://www.xbox.com'),
    createLogoItem('/img/spotify.png', 'Spotify', 'https://www.spotify.com'),
  ]

  const rowTwoGrid = createGrid([])
  resetGrid(rowTwoGrid)
  rowTwoGrid.settings.gap = 6
  rowTwoGrid.items = [
    createLogoItem('/img/bose.png', 'Bose', 'https://www.bose.com'),
    createLogoItem('/img/microsoft.png', 'Microsoft', 'https://www.microsoft.com'),
    createLogoItem('/img/coca-cola.png', 'Coca-Cola', 'https://www.coca-cola.com'),
    createLogoItem('/img/facebook.png', 'Facebook', 'https://www.facebook.com'),
  ]

  block.grids = [textGrid, rowOneGrid, rowTwoGrid]

  return block
}

export function content6Composer(_: ComponentTheme, label: string): BlockCatalogComponent {
  return {
    id: nanoid(8),
    version: 2,
    name: 'content6-composer',
    label,
    type: 'content',
    preview: images.components.content6,
    block: buildContent6ComposerBlock(label),
  }
}
