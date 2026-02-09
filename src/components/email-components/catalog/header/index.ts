import type { SchemaGroupFields } from '@/components/email-components/schema/types'
import type { ComponentBuilder } from '@/types/editor'
import { nanoid } from 'nanoid'
import { images } from '@/components/email-components/catalog/images'
import { COLOR } from '@/components/email-components/constants'
import { f } from '@/components/email-components/fields'
import { defineEmailBlockSchema } from '@/components/email-components/schema/types'

interface HeaderWithMenuSchemaModel {
  Layout: SchemaGroupFields<'attrs'>
  Logo: SchemaGroupFields<'show' | 'attrs' | 'link' | 'align' | 'width'>
  Menu: SchemaGroupFields<'show' | 'items' | 'align' | 'width'>
  Text: SchemaGroupFields<'show' | 'margin' | 'value' | 'attrs'>
}

interface HeaderWithButtonSchemaModel {
  Layout: SchemaGroupFields<'attrs'>
  Logo: SchemaGroupFields<'show' | 'attrs' | 'link' | 'align' | 'width'>
  Text: SchemaGroupFields<'show' | 'margin' | 'value' | 'attrs'>
  Button: SchemaGroupFields<'show' | 'align' | 'attrs' | 'text'>
}

interface HeaderWithImageSchemaModel {
  Layout: SchemaGroupFields<'attrs'>
  Logo: SchemaGroupFields<'show' | 'attrs' | 'link' | 'align' | 'width'>
  Image: SchemaGroupFields<'show' | 'margin' | 'value' | 'attrs'>
  Text: SchemaGroupFields<'show' | 'margin' | 'value' | 'attrs'>
  Button: SchemaGroupFields<'show' | 'align' | 'attrs' | 'text'>
}

interface HeaderWithImageBlockSchemaModel {
  Layout: SchemaGroupFields<'attrs'>
  Logo: SchemaGroupFields<'show' | 'attrs' | 'link' | 'align' | 'width'>
  Text: SchemaGroupFields<'show' | 'margin' | 'value' | 'attrs'>
  ImageBlock: SchemaGroupFields<'show' | 'margin' | 'value' | 'attrs'>
  SubText: SchemaGroupFields<'show' | 'margin' | 'value' | 'attrs'>
  Button: SchemaGroupFields<'show' | 'align' | 'attrs' | 'text'>
}

const headerRoot = {
  root: {
    attrs: 'Layout.attrs',
    clickGroup: 'Layout',
  },
} as const

const headerWithMenuSchema = defineEmailBlockSchema<HeaderWithMenuSchemaModel>({
  ...headerRoot,
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
          width: 'Logo.width',
        },
        {
          type: 'menu',
          group: 'Menu',
          if: 'Menu.show',
          items: 'Menu.items',
          align: 'Menu.align',
          width: 'Menu.width',
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

const headerWithButtonSchema = defineEmailBlockSchema<HeaderWithButtonSchemaModel>({
  ...headerRoot,
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
          width: 'Logo.width',
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
          children: [
            {
              type: 'button',
              group: 'Button',
              if: 'Button.show',
              align: 'Button.align',
              attrs: 'Button.attrs',
              text: 'Button.text',
            },
          ],
        },
      ],
    },
  ],
})

const headerWithImageSchema = defineEmailBlockSchema<HeaderWithImageSchemaModel>({
  ...headerRoot,
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
          width: 'Logo.width',
        },
      ],
    },
    {
      type: 'row',
      if: 'Image.show',
      styleBindings: {
        margin: 'Image.margin',
      },
      children: [
        {
          type: 'text',
          group: 'Image',
          value: 'Image.value',
          attrs: 'Image.attrs',
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
    {
      type: 'row',
      if: 'Button.show',
      children: [
        {
          type: 'button',
          group: 'Button',
          align: 'Button.align',
          attrs: 'Button.attrs',
          text: 'Button.text',
        },
      ],
    },
  ],
})

const headerWithImageBlockSchema = defineEmailBlockSchema<HeaderWithImageBlockSchemaModel>({
  ...headerRoot,
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
          width: 'Logo.width',
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
    {
      type: 'row',
      if: 'ImageBlock.show',
      styleBindings: {
        margin: 'ImageBlock.margin',
      },
      children: [
        {
          type: 'text',
          group: 'ImageBlock',
          value: 'ImageBlock.value',
          attrs: 'ImageBlock.attrs',
        },
      ],
    },
    {
      type: 'row',
      if: 'SubText.show',
      styleBindings: {
        margin: 'SubText.margin',
      },
      children: [
        {
          type: 'text',
          group: 'SubText',
          value: 'SubText.value',
          attrs: 'SubText.attrs',
        },
      ],
    },
    {
      type: 'row',
      if: 'Button.show',
      children: [
        {
          type: 'button',
          group: 'Button',
          align: 'Button.align',
          attrs: 'Button.attrs',
          text: 'Button.text',
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
    schema: headerWithMenuSchema,
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
      f.columnWidth({
        group: 'Logo',
        value: 35,
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
      f.columnWidth({
        group: 'Menu',
        value: 65,
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
    schema: headerWithMenuSchema,
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
      f.columnWidth({
        group: 'Logo',
        value: 35,
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
      f.columnWidth({
        group: 'Menu',
        value: 65,
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
      f.inputNumber({
        group: 'Text',
        key: 'borderRadius',
        label: 'Border Radius',
        value: 5,
      }),
      f.showHide({
        group: 'Text',
      }),
    ],
  }
}

const header3: ComponentBuilder = (_, label) => {
  return {
    id: nanoid(8),
    name: 'Header3',
    label,
    schema: headerWithButtonSchema,
    type: 'header',
    preview: images.components.header3,
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
        value: 'center',
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
      f.spacing({
        group: 'Text',
        value: {
          margin: [30, 0, 0, 0],
          padding: [45, 20, 16, 20],
        },
      }),
      f.mainColor({
        group: 'Text',
        value: COLOR.theme.light,
      }),
      f.content({
        group: 'Text',
        value:
          '<p style="text-align: center"><span style="font-size: 36px"><strong>Don\'t Lose<br/>Yourself.</strong></span></p><p style="text-align: center"><span style="font-size: 18px">New album</span></p>',
      }),
      f.backgroundImage({
        group: 'Text',
        value: {
          url: '/img/bosco-shots-ZoEdO0G0xmI-unsplash.png',
          position: 'top',
          repeat: 'no-repeat',
          size: 'cover',
        },
      }),
      f.inputNumber({
        group: 'Text',
        key: 'borderRadius',
        label: 'Border Radius',
        value: 5,
      }),
      f.showHide({
        group: 'Text',
      }),
      f.align({
        group: 'Button',
        value: 'center',
      }),
      f.spacing({
        group: 'Button',
        value: {
          margin: [40, 0, 40, 0],
          padding: [12, 24, 12, 24],
        },
      }),
      f.backgroundColor({
        group: 'Button',
        value: '#3494FB',
      }),
      f.color({
        group: 'Button',
        value: COLOR.theme.light,
      }),
      f.input({
        group: 'Button',
        key: 'text',
        label: 'Text',
        value: 'Download',
      }),
      f.input({
        group: 'Button',
        key: 'link',
        label: 'Link',
        value: 'https://example.com',
      }),
      f.inputNumber({
        group: 'Button',
        key: 'borderRadius',
        label: 'Border Radius',
        value: 5,
      }),
      f.inputNumber({
        group: 'Button',
        key: 'fontSize',
        label: 'Font Size',
        value: 14,
      }),
      f.showHide({
        group: 'Button',
      }),
    ],
  }
}

const header4: ComponentBuilder = (_, label) => {
  return {
    id: nanoid(8),
    name: 'Header4',
    label,
    schema: headerWithImageSchema,
    type: 'header',
    preview: images.components.header4,
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
        value: 'center',
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
      f.spacing({
        group: 'Image',
        value: {
          margin: [20, 0, 0, 0],
        },
      }),
      f.backgroundImage({
        group: 'Image',
        value: {
          url: '/img/johannes-andersson-v5gGwubKzEA-unsplash.jpg',
          position: 'center',
          repeat: 'no-repeat',
          size: 'cover',
        },
      }),
      f.inputNumber({
        group: 'Image',
        key: 'height',
        label: 'Height',
        value: 296,
      }),
      f.inputNumber({
        group: 'Image',
        key: 'borderRadius',
        label: 'Border Radius',
        value: 5,
      }),
      f.showHide({
        group: 'Image',
      }),
      f.spacing({
        group: 'Text',
        value: {
          margin: [10, 0, 0, 0],
          padding: [0, 0, 0, 0],
        },
      }),
      f.mainColor({
        group: 'Text',
        value: COLOR.theme.dark,
      }),
      f.content({
        group: 'Text',
        value:
          '<p style="text-align: center"><span style="font-size: 18px; color: #9CA3AF">Surfing Season \'19</span></p><p style="text-align: center"><span style="font-size: 32px"><strong>There\'s Change<br/>In The Air.<br/>Can You Feel It?</strong></span></p>',
      }),
      f.showHide({
        group: 'Text',
      }),
      f.align({
        group: 'Button',
        value: 'center',
      }),
      f.spacing({
        group: 'Button',
        value: {
          margin: [20, 0, 0, 0],
          padding: [12, 24, 12, 24],
        },
      }),
      f.backgroundColor({
        group: 'Button',
        value: '#4A98ED',
      }),
      f.color({
        group: 'Button',
        value: COLOR.theme.light,
      }),
      f.input({
        group: 'Button',
        key: 'text',
        label: 'Text',
        value: 'Take Part',
      }),
      f.input({
        group: 'Button',
        key: 'link',
        label: 'Link',
        value: 'https://example.com',
      }),
      f.inputNumber({
        group: 'Button',
        key: 'borderRadius',
        label: 'Border Radius',
        value: 5,
      }),
      f.inputNumber({
        group: 'Button',
        key: 'fontSize',
        label: 'Font Size',
        value: 14,
      }),
      f.showHide({
        group: 'Button',
      }),
    ],
  }
}

const header5: ComponentBuilder = (_, label) => {
  return {
    id: nanoid(8),
    name: 'Header5',
    label,
    schema: headerWithImageBlockSchema,
    type: 'header',
    preview: images.components.header5,
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
        value: 'center',
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
      f.spacing({
        group: 'Text',
        value: {
          margin: [30, 0, 0, 0],
          padding: [0, 0, 0, 0],
        },
      }),
      f.mainColor({
        group: 'Text',
        value: '#7C86C7',
      }),
      f.content({
        group: 'Text',
        value:
          '<p style="text-align: center"><span style="font-size: 18px"><strong>New series</strong></span></p><p style="text-align: center"><span style="font-size: 56px"><strong>The loop by loop.</strong></span></p>',
      }),
      f.showHide({
        group: 'Text',
      }),
      f.spacing({
        group: 'ImageBlock',
        value: {
          margin: [20, 0, 0, 0],
        },
      }),
      f.backgroundImage({
        group: 'ImageBlock',
        value: {
          url: '/img/apple-watch-2.png',
          position: 'center',
          repeat: 'no-repeat',
          size: 'contain',
        },
      }),
      f.inputNumber({
        group: 'ImageBlock',
        key: 'height',
        label: 'Height',
        value: 300,
      }),
      f.inputNumber({
        group: 'ImageBlock',
        key: 'borderRadius',
        label: 'Border Radius',
        value: 0,
      }),
      f.showHide({
        group: 'ImageBlock',
      }),
      f.spacing({
        group: 'SubText',
        value: {
          margin: [20, 0, 0, 0],
          padding: [0, 0, 0, 0],
        },
      }),
      f.mainColor({
        group: 'SubText',
        value: '#A9ADB3',
      }),
      f.content({
        group: 'SubText',
        value:
          '<p style="text-align: center"><span style="font-size: 18px"><strong>With our latest model of watch,<br/>you\'ll get the most amazing features<br/>for your everyday workout.</strong></span></p>',
      }),
      f.showHide({
        group: 'SubText',
      }),
      f.align({
        group: 'Button',
        value: 'center',
      }),
      f.spacing({
        group: 'Button',
        value: {
          margin: [20, 0, 0, 0],
          padding: [12, 24, 12, 24],
        },
      }),
      f.backgroundColor({
        group: 'Button',
        value: '#4A98ED',
      }),
      f.color({
        group: 'Button',
        value: COLOR.theme.light,
      }),
      f.input({
        group: 'Button',
        key: 'text',
        label: 'Text',
        value: 'Take Yours',
      }),
      f.input({
        group: 'Button',
        key: 'link',
        label: 'Link',
        value: 'https://example.com',
      }),
      f.inputNumber({
        group: 'Button',
        key: 'borderRadius',
        label: 'Border Radius',
        value: 5,
      }),
      f.inputNumber({
        group: 'Button',
        key: 'fontSize',
        label: 'Font Size',
        value: 14,
      }),
      f.showHide({
        group: 'Button',
      }),
    ],
  }
}

export const header = [
  header1('light', 'Header 1'),
  header2('light', 'Header 2'),
  header3('light', 'Header 3'),
  header4('light', 'Header 4'),
  header5('light', 'Header 5'),
]
