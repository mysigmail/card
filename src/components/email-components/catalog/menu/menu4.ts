import type { ComponentBuilder, ComponentTheme } from '@/types/editor'
import { nanoid } from 'nanoid'
import { images } from '@/components/email-components/catalog/images'
import { composeEmailBlock, image, row } from '@/components/email-components/composition'
import { COLOR } from '@/components/email-components/constants'
import { f } from '@/components/email-components/fields'
import { menuItems } from './shared'

const menu4Composition = composeEmailBlock({
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
    logo: ['show', 'attrs', 'link', 'align', 'padding'],
    menu: ['show', 'items', 'align', 'padding'],
  } as const,
  schema: ({ groups, path }) => ({
    root: {
      attrs: path('layout', 'attrs'),
      clickGroup: groups.layout.id,
    },
    nodes: [
      row({
        styleBindings: {
          padding: path('logo', 'padding'),
        },
        children: [
          image({
            group: groups.logo.id,
            if: path('logo', 'show'),
            attrs: path('logo', 'attrs'),
            link: path('logo', 'link'),
            align: path('logo', 'align'),
          }),
        ],
      }),
      row({
        styleBindings: {
          padding: path('menu', 'padding'),
        },
        children: [
          {
            type: 'menu',
            group: groups.menu.id,
            if: path('menu', 'show'),
            items: path('menu', 'items'),
            align: path('menu', 'align'),
          },
        ],
      }),
    ],
  }),
  tools: ({ groups }) => {
    return [
      f.padding({
        group: groups.layout,
        value: [30, 35, 30, 35],
      }),
      f.backgroundColor({
        group: groups.layout,
        value: COLOR.theme.light,
      }),
      f.padding({
        group: groups.logo,
        value: [0, 0, 0, 0],
      }),
      f.align({
        group: groups.logo,
        value: 'left',
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
      f.padding({
        group: groups.menu,
        value: [20, 0, 0, 0],
      }),
      f.align({
        group: groups.menu,
        value: 'left',
      }),
      f.list({
        group: groups.menu,
        value: menuItems(COLOR.theme.dark),
      }),
      f.showHide({
        group: groups.menu,
      }),
    ]
  },
})

export const menu4: ComponentBuilder = (theme: ComponentTheme, label) => {
  const preview = theme === 'dark' ? images.components.menu4.dark : images.components.menu4.light
  const logo = theme === 'dark' ? images.logo.white : images.logo.black
  const backgroundColor = theme === 'dark' ? COLOR.theme.dark : COLOR.theme.light
  const linkColor = theme === 'dark' ? COLOR.theme.light : COLOR.theme.dark

  const tools = menu4Composition.createTools()

  const bgTool = tools.find(
    tool => tool.groupId === menu4Composition.groups.layout.id && tool.key === 'backgroundColor',
  )
  const logoTool = tools.find(
    tool => tool.groupId === menu4Composition.groups.logo.id && tool.key === 'image',
  )
  const menuTool = tools.find(
    tool => tool.groupId === menu4Composition.groups.menu.id && tool.key === 'list',
  )

  if (bgTool)
    bgTool.value = backgroundColor

  if (logoTool && logoTool.type === 'image')
    logoTool.value.src = logo

  if (menuTool)
    menuTool.value = menuItems(linkColor)

  return {
    id: nanoid(8),
    name: 'Menu4',
    label,
    schema: menu4Composition.schema,
    type: 'menu',
    preview,
    tools,
  }
}
