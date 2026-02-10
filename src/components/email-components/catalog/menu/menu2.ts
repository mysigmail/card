import type { ComponentBuilder, ComponentTheme } from '@/types/editor'
import { nanoid } from 'nanoid'
import { images } from '@/components/email-components/catalog/images'
import { composeEmailBlock, image, row } from '@/components/email-components/composition'
import { COLOR } from '@/components/email-components/constants'
import { f } from '@/components/email-components/fields'
import { menuItems } from './shared'

const menu2Composition = composeEmailBlock({
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
    divider: {
      role: 'divider',
      id: 'divider',
      label: 'Divider',
    },
  } as const,
  fields: {
    layout: ['attrs'],
    logo: ['show', 'attrs', 'link', 'align', 'padding'],
    menu: ['show', 'items', 'align', 'padding'],
    divider: ['show', 'color', 'padding'],
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
      {
        type: 'divider',
        if: path('divider', 'show'),
        group: groups.divider.id,
        color: path('divider', 'color'),
        styleBindings: {
          padding: path('divider', 'padding'),
        },
      },
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
        group: groups.divider,
        value: [10, 0, 10, 0],
      }),
      f.color({
        group: groups.divider,
        value: COLOR.divider.dark,
      }),
      f.showHide({
        group: groups.divider,
      }),
      f.padding({
        group: groups.logo,
        value: [0, 0, 0, 0],
      }),
      f.align({
        group: groups.logo,
        value: 'center',
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
        value: [0, 0, 0, 0],
      }),
      f.align({
        group: groups.menu,
        value: 'center',
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

export const menu2: ComponentBuilder = (theme: ComponentTheme, label) => {
  const preview = theme === 'dark' ? images.components.menu2.dark : images.components.menu2.light
  const logo = theme === 'dark' ? images.logo.white : images.logo.black
  const backgroundColor = theme === 'dark' ? COLOR.theme.dark : COLOR.theme.light
  const linkColor = theme === 'dark' ? COLOR.theme.light : COLOR.theme.dark
  const dividerColor = theme === 'dark' ? COLOR.divider.light : COLOR.divider.dark

  const tools = menu2Composition.createTools()

  const bgTool = tools.find(
    tool => tool.groupId === menu2Composition.groups.layout.id && tool.key === 'backgroundColor',
  )
  const dividerTool = tools.find(
    tool => tool.groupId === menu2Composition.groups.divider.id && tool.key === 'color',
  )
  const logoTool = tools.find(
    tool => tool.groupId === menu2Composition.groups.logo.id && tool.key === 'image',
  )
  const menuTool = tools.find(
    tool => tool.groupId === menu2Composition.groups.menu.id && tool.key === 'list',
  )

  if (bgTool)
    bgTool.value = backgroundColor

  if (dividerTool)
    dividerTool.value = dividerColor

  if (logoTool && logoTool.type === 'image')
    logoTool.value.src = logo

  if (menuTool)
    menuTool.value = menuItems(linkColor)

  return {
    id: nanoid(8),
    name: 'Menu2',
    label,
    schema: menu2Composition.schema,
    type: 'menu',
    preview,
    tools,
  }
}
