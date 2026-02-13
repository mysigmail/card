import type { BlockNode, MenuAtomImageItem } from '@/types/block'
import type { BlockPreset, ComponentTheme } from '@/types/editor'
import { nanoid } from 'nanoid'
import { createBlockNode, createMenuAtom } from '@/components/email-components/block-factory'
import {
  buildImageAtom,
  createCell,
  resetRow,
} from '@/components/email-components/catalog/composer-helpers'
import { images } from '@/components/email-components/catalog/images'
import { COLOR } from '@/components/email-components/constants'

function buildMenu3Block(theme: ComponentTheme, label: string): BlockNode {
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

  const block = createBlockNode(label)
  block.settings.spacing = {
    padding: [30, 35, 30, 35],
  }
  block.settings.backgroundColor = backgroundColor
  block.settings.backgroundImage = undefined

  const row = block.rows[0]
  resetRow(row)

  const logoItem = createCell({
    horizontalAlign: 'left',
    verticalAlign: 'middle',
    atoms: [
      buildImageAtom({
        src: logo,
        width: 110,
      }),
    ],
  })

  const socialItem = createCell({
    horizontalAlign: 'right',
    verticalAlign: 'middle',
    atoms: [socialMenu],
  })

  row.cells = [logoItem, socialItem]
  block.rows = [row]

  return block
}

export function menu3Preset(theme: ComponentTheme, label: string): BlockPreset {
  const preview = theme === 'dark' ? images.components.menu3.dark : images.components.menu3.light

  return {
    id: nanoid(8),
    version: 2,
    name: 'menu3',
    label,
    type: 'menu',
    preview,
    block: buildMenu3Block(theme, label),
  }
}
