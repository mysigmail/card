import type { ComponentBuilder, ComponentTheme } from '@/types/editor'
import { nanoid } from 'nanoid'
import { images } from '@/components/email-components/catalog/images'
import { composeEmailBlock, image, row } from '@/components/email-components/composition'
import { COLOR } from '@/components/email-components/constants'
import { f } from '@/components/email-components/fields'
import { menuItems } from './shared'

const menu1Composition = composeEmailBlock({
  groups: {
    layout: {
      role: 'layout',
      id: 'layout',
      label: 'Layout',
    },
    logo: {
      role: 'image',
      id: 'logo',
      label: 'Logo',
    },
    menu: {
      role: 'menu',
      id: 'menu',
      label: 'Menu',
    },
  } as const,
  fields: {
    layout: ['attrs'],
    logo: ['show', 'attrs', 'link', 'align', 'width'],
    menu: ['show', 'items', 'align', 'width'],
  } as const,
  schema: ({ groups, path }) => ({
    root: {
      attrs: path('layout', 'attrs'),
      clickGroup: groups.layout.id,
    },
    nodes: [
      row({
        children: [
          image({
            group: groups.logo.id,
            if: path('logo', 'show'),
            attrs: path('logo', 'attrs'),
            link: path('logo', 'link'),
            align: path('logo', 'align'),
            width: path('logo', 'width'),
          }),
          {
            type: 'menu',
            group: groups.menu.id,
            if: path('menu', 'show'),
            items: path('menu', 'items'),
            align: path('menu', 'align'),
            width: path('menu', 'width'),
          },
        ],
      }),
    ],
  }),
  tools: ({ groups }) => {
    return [
      f.spacing({
        group: groups.layout,
        value: {
          padding: [30, 35, 30, 35],
        },
      }),
      f.align({
        group: groups.logo,
        value: 'left',
      }),
      f.columnWidth({
        group: groups.logo,
        value: 35,
      }),
      f.image({
        group: groups.logo,
        value: {
          src: '',
          link: 'https://example.com',
          alt: 'Some alt',
          width: 110,
        },
      }),
      f.showHide({
        group: groups.logo,
      }),
      f.align({
        group: groups.menu,
        value: 'right',
      }),
      f.columnWidth({
        group: groups.menu,
        value: 65,
      }),
      f.list({
        group: groups.menu,
        value: menuItems('#000000'),
      }),
      f.showHide({
        group: groups.menu,
      }),
      // Theme-dependent tools are overridden in builder.
      f.backgroundColor({
        group: groups.layout,
        value: COLOR.theme.light,
      }),
    ]
  },
})

export const menu1: ComponentBuilder = (theme: ComponentTheme, label) => {
  const preview = theme === 'dark' ? images.components.menu1.dark : images.components.menu1.light
  const logo = theme === 'dark' ? images.logo.white : images.logo.black
  const backgroundColor = theme === 'dark' ? COLOR.theme.dark : COLOR.theme.light
  const linkColor = theme === 'dark' ? COLOR.theme.light : COLOR.theme.dark

  const tools = menu1Composition.createTools()

  const bgTool = tools.find(
    tool => tool.groupId === menu1Composition.groups.layout.id && tool.key === 'backgroundColor',
  )
  const logoTool = tools.find(
    tool => tool.groupId === menu1Composition.groups.logo.id && tool.key === 'image',
  )
  const menuTool = tools.find(
    tool => tool.groupId === menu1Composition.groups.menu.id && tool.key === 'list',
  )

  if (bgTool)
    bgTool.value = backgroundColor

  if (logoTool && logoTool.type === 'image')
    logoTool.value.src = logo

  if (menuTool)
    menuTool.value = menuItems(linkColor)

  return {
    id: nanoid(8),
    name: 'Menu1',
    label,
    schema: menu1Composition.schema,
    type: 'menu',
    preview,
    tools,
  }
}
