import type { Block } from '@/types/block'
import type { BlockCatalogComponent, ComponentTheme } from '@/types/editor'
import { nanoid } from 'nanoid'
import { createBlock, createGrid } from '@/components/email-components/block-factory'
import {
  createButtonAtomNode,
  createImageAtomNode,
  createImageBlockItem,
  createItemNode,
  createTextAtomNode,
  resetGrid,
} from '@/components/email-components/catalog/composer-helpers'
import { images } from '@/components/email-components/catalog/images'
import { COLOR } from '@/components/email-components/constants'

function buildHeader4ComposerBlock(label: string): Block {
  const imageMainHeight = 296

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

  const imageGrid = createGrid([])
  resetGrid(imageGrid)
  imageGrid.settings.spacing = {
    margin: [0, 0, 0, 0],
    padding: [20, 0, 0, 0],
  }
  imageGrid.items = [
    createImageBlockItem('/img/johannes-andersson-v5gGwubKzEA-unsplash.jpg', {
      height: imageMainHeight,
      borderRadius: 5,
      link: 'https://example.com',
    }),
  ]

  const textGrid = createGrid([])
  resetGrid(textGrid)
  textGrid.settings.spacing = {
    margin: [0, 0, 0, 0],
    padding: [10, 0, 0, 0],
  }
  textGrid.items = [
    createItemNode({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [
        createTextAtomNode({
          value:
            '<p style="text-align: center"><span style="font-size: 18px; color: #9CA3AF">Surfing Season \'19</span></p><p style="text-align: center"><span style="font-size: 32px"><strong>There\'s Change<br/>In The Air.<br/>Can You Feel It?</strong></span></p>',
          color: COLOR.theme.dark,
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

  block.grids = [logoGrid, imageGrid, textGrid, buttonGrid]

  return block
}

export function header4Composer(_: ComponentTheme, label: string): BlockCatalogComponent {
  return {
    id: nanoid(8),
    version: 2,
    name: 'header4-composer',
    label,
    type: 'header',
    preview: images.components.header4,
    block: buildHeader4ComposerBlock(label),
  }
}
