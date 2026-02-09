import { nanoid } from 'nanoid'
import { images } from '@/components/email-components/catalog/images'
import { COLOR } from '@/components/email-components/constants'
import { f } from '@/components/email-components/fields'
import { defineEmailBlockSchema } from '@/components/email-components/schema/types'
import type { SchemaGroupFields } from '@/components/email-components/schema/types'
import type { ComponentBuilder } from '@/types/editor'

interface HeaderSchemaModel {
  Layout: SchemaGroupFields<'attrs'>
  Logo: SchemaGroupFields<'show' | 'attrs' | 'link' | 'align'>
  Menu: SchemaGroupFields<'show' | 'items' | 'align'>
  Text: SchemaGroupFields<'show' | 'margin' | 'value' | 'attrs'>
}

const headerSchema = defineEmailBlockSchema<HeaderSchemaModel>({
  root: {
    attrs: 'Layout.attrs',
    clickGroup: 'Layout',
  },
  nodes: [
    {
      type: 'row',
      children: [
        {
          type: 'logo',
          group: 'Logo',
          if: 'Logo.show',
          attrs: 'Logo.attrs',
          link: 'Logo.link',
          align: 'Logo.align',
        },
        {
          type: 'menu',
          group: 'Menu',
          if: 'Menu.show',
          items: 'Menu.items',
          align: 'Menu.align',
        },
      ],
    },
    {
      type: 'row',
      if: 'Text.show',
      styleBindings: {
        margin: 'Text.margin',
      },
      children: [
        {
          type: 'text',
          group: 'Text',
          value: 'Text.value',
          attrs: 'Text.attrs',
        },
      ],
    },
  ],
})

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

const header1: ComponentBuilder = (_, label) => {
  return {
    id: nanoid(8),
    name: 'Header1',
    label,
    schema: headerSchema,
    type: 'header',
    preview: images.components.header1,
    tools: [
      f.spacing({
        group: 'Layout',
        value: {
          padding: [30, 35, 30, 35],
        },
      }),
      f.backgroundColor({
        group: 'Layout',
        value: COLOR.theme.dark,
      }),
      f.backgroundImage({
        group: 'Layout',
        value: {
          url: '/img/josh-nuttall-pIwu5XNvXpk-unsplash.png',
          position: 'center',
          repeat: 'no-repeat',
          size: 'cover',
        },
      }),
      f.align({
        group: 'Logo',
        value: 'left',
      }),
      f.image({
        group: 'Logo',
        value: {
          src: images.logo.white,
          link: 'https://example.com',
          alt: 'Some alt',
          width: 110,
        },
      }),
      f.showHide({
        group: 'Logo',
      }),
      f.align({
        group: 'Menu',
        value: 'right',
      }),
      f.list({
        group: 'Menu',
        value: menuItems(COLOR.theme.light),
      }),
      f.showHide({
        group: 'Menu',
      }),
      f.spacing({
        group: 'Text',
        value: {
          margin: [50, 0, 0, 0],
          padding: [0, 0, 0, 0],
        },
      }),
      f.mainColor({
        group: 'Text',
        value: COLOR.theme.light,
      }),
      f.content({
        group: 'Text',
        value:
          '<p><strong><span style="font-size: 18px">Unleash Freedom</span></strong></p><p><span style="color: rgb(159, 249, 141); font-size: 48px">Discover</span><span style="font-size: 48px"> the Unmatched Thrill with Our </span><span style="color: #9FF98D; font-size: 48px">New Bicycle</span></p>',
      }),
      f.showHide({
        group: 'Text',
      }),
    ],
  }
}

const header2: ComponentBuilder = (_, label) => {
  return {
    id: nanoid(8),
    name: 'Header2',
    label,
    schema: headerSchema,
    type: 'header',
    preview: images.components.header2,
    tools: [
      f.spacing({
        group: 'Layout',
        value: {
          padding: [30, 35, 30, 35],
        },
      }),
      f.backgroundColor({
        group: 'Layout',
        value: COLOR.theme.light,
      }),
      f.align({
        group: 'Logo',
        value: 'left',
      }),
      f.image({
        group: 'Logo',
        value: {
          src: images.logo.black,
          link: 'https://example.com',
          alt: 'Some alt',
          width: 110,
        },
      }),
      f.showHide({
        group: 'Logo',
      }),
      f.align({
        group: 'Menu',
        value: 'right',
      }),
      f.list({
        group: 'Menu',
        value: menuItems(COLOR.theme.dark),
      }),
      f.showHide({
        group: 'Menu',
      }),
      f.spacing({
        group: 'Text',
        value: {
          margin: [30, 0, 0, 0],
          padding: [140, 20, 20, 20],
        },
      }),
      f.mainColor({
        group: 'Text',
        value: COLOR.theme.light,
      }),
      f.content({
        group: 'Text',
        value:
          '<p style="text-align: center"><span style="font-size: 18px">New Stool</span></p><p style="text-align: center"><span style="font-size: 36px"><u>Simplicity. Practicality. Naturality</u></span></p>',
      }),
      f.backgroundImage({
        group: 'Text',
        value: {
          url: '/img/ruslan-bardash-4kTbAMRAHtQ-unsplash.png',
          position: 'top',
          repeat: 'no-repeat',
          size: 'cover',
        },
      }),
      f.showHide({
        group: 'Text',
      }),
    ],
  }
}

export const header = [header1('light', 'Header 1'), header2('light', 'Header 2')]
