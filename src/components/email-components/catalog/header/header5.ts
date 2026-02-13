import type { Block } from '@/types/block'
import type { BlockCatalogComponent, ComponentTheme } from '@/types/editor'
import { nanoid } from 'nanoid'
import { createBlock, createGrid } from '@/components/email-components/block-factory'
import {
  createButtonAtomNode,
  createImageAtomNode,
  createItemNode,
  createTextAtomNode,
  resetGrid,
} from '@/components/email-components/catalog/composer-helpers'
import { images } from '@/components/email-components/catalog/images'
import { COLOR } from '@/components/email-components/constants'

function buildHeader5ComposerBlock(label: string): Block {
  const imageBlockHeight = 300

  const block = createBlock(label)
  block.settings.spacing = {
    padding: [30, 35, 30, 35],
  }
  block.settings.backgroundColor = COLOR.theme.light
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
          width: 110,
        }),
      ],
    }),
  ]

  const mainTextGrid = createGrid([])
  resetGrid(mainTextGrid)
  mainTextGrid.settings.spacing = {
    margin: [0, 0, 0, 0],
    padding: [30, 0, 0, 0],
  }
  mainTextGrid.items = [
    createItemNode({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [
        createTextAtomNode({
          value:
            '<p style="text-align: center"><span style="color: rgb(124, 134, 199); font-size: 18px">New series</span></p><p style="text-align: center"><strong><span style="font-size: 32px">The loop by loop.</span></strong></p>',
          color: '#000000',
        }),
      ],
    }),
  ]

  const imageBlockGrid = createGrid([])
  resetGrid(imageBlockGrid)
  imageBlockGrid.settings.spacing = {
    margin: [0, 0, 0, 0],
    padding: [20, 0, 0, 0],
  }
  imageBlockGrid.items = [
    createItemNode({
      horizontalAlign: 'center',
      verticalAlign: 'top',
      borderRadius: 0,
      atoms: [
        createImageAtomNode({
          src: '/img/apple-watch-2.png',
          width: 450,
          height: imageBlockHeight,
        }),
      ],
    }),
  ]

  const secondaryTextGrid = createGrid([])
  resetGrid(secondaryTextGrid)
  secondaryTextGrid.settings.spacing = {
    margin: [0, 0, 0, 0],
    padding: [20, 0, 0, 0],
  }
  secondaryTextGrid.items = [
    createItemNode({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [
        createTextAtomNode({
          value:
            '<p style="text-align: center"><span style="font-size: 18px">With our latest model of watch,<br>you\'ll get the most amazing features<br>for your everyday workout.</span></p>',
          color: '#A9ADB3',
        }),
      ],
    }),
  ]

  const buttonGrid = createGrid([])
  resetGrid(buttonGrid)
  buttonGrid.items = [
    createItemNode({
      horizontalAlign: 'center',
      verticalAlign: 'top',
      atoms: [
        createButtonAtomNode({
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

  block.grids = [logoGrid, mainTextGrid, imageBlockGrid, secondaryTextGrid, buttonGrid]

  return block
}

export function header5Composer(_: ComponentTheme, label: string): BlockCatalogComponent {
  return {
    id: nanoid(8),
    version: 2,
    name: 'header5-composer',
    label,
    type: 'header',
    preview: images.components.header5,
    block: buildHeader5ComposerBlock(label),
  }
}
