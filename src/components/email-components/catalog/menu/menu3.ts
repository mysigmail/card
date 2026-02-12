import type { ComponentBuilder, ComponentTheme } from '@/types/editor'
import { nanoid } from 'nanoid'
import { images } from '@/components/email-components/catalog/images'
import { composeEmailBlock, image, row } from '@/components/email-components/composition'
import { COLOR } from '@/components/email-components/constants'
import { f } from '@/components/email-components/fields'
import { socialItems } from './shared'

const menu3Composition = composeEmailBlock({
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
    social: {
      role: 'social',
      id: 'social',
      label: 'Social',
    },
  } as const,
  fields: {
    layout: ['attrs'],
    logo: ['show', 'attrs', 'link', 'align', 'width'],
    social: ['show', 'items', 'align', 'width'],
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
            type: 'social',
            group: groups.social.id,
            if: path('social', 'show'),
            items: path('social', 'items'),
            align: path('social', 'align'),
            width: path('social', 'width'),
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
      f.backgroundColor({
        group: groups.layout,
        value: COLOR.theme.light,
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
        group: groups.social,
        value: 'right',
      }),
      f.columnWidth({
        group: groups.social,
        value: 65,
      }),
      f.list({
        group: groups.social,
        value: socialItems('light'),
      }),
      f.showHide({
        group: groups.social,
      }),
    ]
  },
})

export const menu3: ComponentBuilder = (theme: ComponentTheme, label) => {
  const preview = theme === 'dark' ? images.components.menu3.dark : images.components.menu3.light
  const logo = theme === 'dark' ? images.logo.white : images.logo.black
  const backgroundColor = theme === 'dark' ? COLOR.theme.dark : COLOR.theme.light

  const tools = menu3Composition.createTools()

  const bgTool = tools.find(
    tool => tool.groupId === menu3Composition.groups.layout.id && tool.key === 'backgroundColor',
  )
  const logoTool = tools.find(
    tool => tool.groupId === menu3Composition.groups.logo.id && tool.key === 'image',
  )
  const socialTool = tools.find(
    tool => tool.groupId === menu3Composition.groups.social.id && tool.key === 'list',
  )

  if (bgTool)
    bgTool.value = backgroundColor

  if (logoTool && logoTool.type === 'image')
    logoTool.value.src = logo

  if (socialTool)
    socialTool.value = socialItems(theme)

  return {
    id: nanoid(8),
    name: 'Menu3',
    label,
    schema: menu3Composition.schema,
    type: 'menu',
    preview,
    tools,
  }
}
