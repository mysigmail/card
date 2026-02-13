import type { Block, MenuAtomImageItem } from '@/types/block'
import type { BlockCatalogComponent, ComponentTheme } from '@/types/editor'
import { nanoid } from 'nanoid'
import { createBlock, createMenuAtom } from '@/components/email-components/block-factory'
import {
  createImageAtomNode,
  createItemNode,
  resetGrid,
} from '@/components/email-components/catalog/composer-helpers'
import { images } from '@/components/email-components/catalog/images'
import { COLOR } from '@/components/email-components/constants'

function buildMenu3ComposerBlock(theme: ComponentTheme, label: string): Block {
  const logo = theme === 'dark' ? images.logo.white : images.logo.black
  const isDark = theme === 'dark'
  const backgroundColor = theme === 'dark' ? COLOR.theme.dark : COLOR.theme.light

  const socialItems: MenuAtomImageItem[] = [
    {
      type: 'image',
      name: 'Facebook',
      link: 'https://example',
      url: isDark ? images.socials.facebook.white : images.socials.facebook.black,
      width: 16,
      height: 16,
      alt: 'Some alt',
    },
    {
      type: 'image',
      name: 'Twitter',
      link: 'https://example',
      url: isDark ? images.socials.twitter.white : images.socials.twitter.black,
      width: 16,
      height: 16,
      alt: 'Some alt',
    },
    {
      type: 'image',
      name: 'Instagram',
      link: 'https://example',
      url: isDark ? images.socials.instagram.white : images.socials.instagram.black,
      width: 16,
      height: 16,
      alt: 'Some alt',
    },
  ]

  const socialMenu = createMenuAtom()
  socialMenu.itemType = 'image'
  socialMenu.gap = 18
  socialMenu.spacing = {
    margin: [0, 0, 0, 0],
    padding: [0, 0, 0, 0],
  }
  socialMenu.items = socialItems

  const block = createBlock(label)
  block.settings.spacing = {
    padding: [30, 35, 30, 35],
  }
  block.settings.backgroundColor = backgroundColor
  block.settings.backgroundImage = undefined

  const grid = block.grids[0]
  resetGrid(grid)

  const logoItem = createItemNode({
    horizontalAlign: 'left',
    verticalAlign: 'middle',
    atoms: [
      createImageAtomNode({
        src: logo,
        width: 110,
      }),
    ],
  })

  const socialItem = createItemNode({
    horizontalAlign: 'right',
    verticalAlign: 'middle',
    atoms: [socialMenu],
  })

  grid.items = [logoItem, socialItem]
  block.grids = [grid]

  return block
}

export function menu3Composer(theme: ComponentTheme, label: string): BlockCatalogComponent {
  const preview = theme === 'dark' ? images.components.menu3.dark : images.components.menu3.light

  return {
    id: nanoid(8),
    version: 2,
    name: 'menu3-composer',
    label,
    type: 'menu',
    preview,
    block: buildMenu3ComposerBlock(theme, label),
  }
}
