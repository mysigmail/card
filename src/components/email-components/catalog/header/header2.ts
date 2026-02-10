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

const header2Composition = composeEmailBlock({
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
        src: images.logo.black,
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
      value: menuItems(COLOR.theme.dark),
    }),
    f.showHide({
      group: groups.menu,
    }),
    f.spacing({
      group: groups.textMain,
      value: {
        margin: [30, 0, 0, 0],
        padding: [140, 20, 20, 20],
      },
    }),
    f.mainColor({
      group: groups.textMain,
      value: COLOR.theme.light,
    }),
    f.content({
      group: groups.textMain,
      value:
        '<p style="text-align: center"><span style="font-size: 18px">New Stool</span></p><p style="text-align: center"><span style="font-size: 36px"><u>Simplicity. Practicality. Naturality</u></span></p>',
    }),
    f.backgroundImage({
      group: groups.textMain,
      value: {
        url: '/img/ruslan-bardash-4kTbAMRAHtQ-unsplash.png',
        position: 'top',
        repeat: 'no-repeat',
        size: 'cover',
      },
    }),
    f.inputNumber({
      group: groups.textMain,
      key: 'borderRadius',
      label: 'Border Radius',
      value: 5,
    }),
    f.showHide({
      group: groups.textMain,
    }),
  ],
})

export const header2: ComponentBuilder = (_, label) => {
  return {
    id: nanoid(8),
    name: 'Header2',
    label,
    schema: header2Composition.schema,
    type: 'header',
    preview: images.components.header2,
    tools: header2Composition.createTools(),
  }
}
