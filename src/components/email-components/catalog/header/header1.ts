import type { ComponentBuilder } from '@/types/editor'
import { nanoid } from 'nanoid'
import { images } from '@/components/email-components/catalog/images'
import { composeEmailBlock, image, row, text } from '@/components/email-components/composition'
import { COLOR } from '@/components/email-components/constants'
import { f } from '@/components/email-components/fields'

function menuItems(color: string) {
  return [
    f.menuItem({
      name: 'Specs',
      link: 'https://example',
      color,
      fontSize: 16,
    }),
    f.menuItem({
      name: 'Feature',
      link: 'https://example',
      color,
      fontSize: 16,
    }),
    f.menuItem({
      name: 'Price',
      link: 'https://example',
      color,
      fontSize: 16,
    }),
  ]
}

const header1Composition = composeEmailBlock({
  groups: {
    layout: {
      role: 'layout',
      id: 'Layout',
      label: 'Layout',
    },
    logo: {
      role: 'image',
      id: 'Logo',
      label: 'Logo',
    },
    menu: {
      role: 'menu',
      id: 'Menu',
      label: 'Menu',
    },
    textMain: {
      role: 'text',
      id: 'Text',
      label: 'Text',
    },
  } as const,
  fields: {
    layout: ['attrs'],
    logo: ['show', 'attrs', 'link', 'align', 'width'],
    menu: ['show', 'items', 'align', 'width'],
    textMain: ['show', 'margin', 'value', 'attrs'],
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
      row({
        if: path('textMain', 'show'),
        styleBindings: {
          margin: path('textMain', 'margin'),
        },
        children: [
          text({
            group: groups.textMain.id,
            value: path('textMain', 'value'),
            attrs: path('textMain', 'attrs'),
          }),
        ],
      }),
    ],
  }),
  tools: ({ groups }) => [
    f.spacing({
      group: groups.layout,
      value: {
        padding: [30, 35, 30, 35],
      },
    }),
    f.backgroundColor({
      group: groups.layout,
      value: COLOR.theme.dark,
    }),
    f.backgroundImage({
      group: groups.layout,
      value: {
        url: '/img/josh-nuttall-pIwu5XNvXpk-unsplash.png',
        position: 'center',
        repeat: 'no-repeat',
        size: 'cover',
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
        src: images.logo.white,
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
      value: menuItems(COLOR.theme.light),
    }),
    f.showHide({
      group: groups.menu,
    }),
    f.spacing({
      group: groups.textMain,
      value: {
        margin: [50, 0, 0, 0],
        padding: [0, 0, 0, 0],
      },
    }),
    f.mainColor({
      group: groups.textMain,
      value: COLOR.theme.light,
    }),
    f.content({
      group: groups.textMain,
      value:
        '<p><strong><span style="font-size: 18px">Unleash Freedom</span></strong></p><p><span style="color: rgb(159, 249, 141); font-size: 48px">Discover</span><span style="font-size: 48px"> the Unmatched Thrill with Our </span><span style="color: #9FF98D; font-size: 48px">New Bicycle</span></p>',
    }),
    f.showHide({
      group: groups.textMain,
    }),
  ],
})

export const header1: ComponentBuilder = (_, label) => {
  return {
    id: nanoid(8),
    name: 'Header1',
    label,
    schema: header1Composition.schema,
    type: 'header',
    preview: images.components.header1,
    tools: header1Composition.createTools(),
  }
}
