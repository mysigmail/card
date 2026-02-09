import type { SchemaGroupFields } from '@/components/email-components/schema/types'
import type { ComponentBuilder } from '@/types/editor'
import { nanoid } from 'nanoid'
import { images } from '@/components/email-components/catalog/images'
import { COLOR } from '@/components/email-components/constants'
import { f } from '@/components/email-components/fields'
import { createSchemaGroups, gp } from '@/components/email-components/schema/groups'
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
  Image: SchemaGroupFields<'show' | 'margin' | 'value' | 'attrs' | 'link'>
  Text: SchemaGroupFields<'show' | 'margin' | 'value' | 'attrs'>
  Button: SchemaGroupFields<'show' | 'align' | 'attrs' | 'text'>
}

interface HeaderWithImageBlockSchemaModel {
  Layout: SchemaGroupFields<'attrs'>
  Logo: SchemaGroupFields<'show' | 'attrs' | 'link' | 'align' | 'width'>
  Text: SchemaGroupFields<'show' | 'margin' | 'value' | 'attrs'>
  ImageBlock: SchemaGroupFields<'show' | 'margin' | 'value' | 'attrs' | 'link'>
  TextSecondary: SchemaGroupFields<'show' | 'margin' | 'value' | 'attrs'>
  Button: SchemaGroupFields<'show' | 'align' | 'attrs' | 'text'>
}

interface HeaderWithGridSchemaModel {
  Layout: SchemaGroupFields<'attrs'>
  Logo: SchemaGroupFields<'show' | 'attrs' | 'link' | 'align' | 'width'>
  Image: SchemaGroupFields<'show' | 'margin' | 'value' | 'attrs' | 'link'>
  Text: SchemaGroupFields<'show' | 'margin' | 'value' | 'attrs'>
  ImageBlock: SchemaGroupFields<'show' | 'margin' | 'value' | 'attrs' | 'link'>
  TextSecondary: SchemaGroupFields<'show' | 'margin' | 'value' | 'attrs'>
  Grid: SchemaGroupFields<'show' | 'margin' | 'items' | 'align' | 'width' | 'gap'>
}

const groupBuilder = createSchemaGroups()
const groups = {
  layout: groupBuilder.group('layout', { id: 'Layout', label: 'Layout' }),
  logo: groupBuilder.group('image', { id: 'Logo', label: 'Logo' }),
  menu: groupBuilder.group('menu', { id: 'Menu', label: 'Menu' }),
  textMain: groupBuilder.group('text', { id: 'Text', label: 'Text' }),
  imageMain: groupBuilder.group('imageBlock', { id: 'Image', label: 'Image' }),
  imageBlock: groupBuilder.group('imageBlock', { id: 'ImageBlock', label: 'Image Block' }),
  textSecondary: groupBuilder.group('text', { id: 'TextSecondary', label: 'Secondary Text' }),
  grid: groupBuilder.group('grid', { id: 'Grid', label: 'Grid' }),
  button: groupBuilder.group('button', { id: 'Button', label: 'Button' }),
} as const

const headerRoot = {
  root: {
    attrs: gp(groups.layout, 'attrs'),
    clickGroup: groups.layout.id,
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
          group: groups.logo.id,
          if: 'Logo.show',
          attrs: 'Logo.attrs',
          link: 'Logo.link',
          align: 'Logo.align',
          width: 'Logo.width',
        },
        {
          type: 'menu',
          group: groups.menu.id,
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
          group: groups.textMain.id,
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
          group: groups.logo.id,
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
          group: groups.textMain.id,
          value: 'Text.value',
          attrs: 'Text.attrs',
          children: [
            {
              type: 'button',
              group: groups.button.id,
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
          group: groups.logo.id,
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
          group: groups.imageMain.id,
          link: 'Image.link',
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
          group: groups.textMain.id,
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
          group: groups.button.id,
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
          group: groups.logo.id,
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
          group: groups.textMain.id,
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
          group: groups.imageBlock.id,
          link: 'ImageBlock.link',
          value: 'ImageBlock.value',
          attrs: 'ImageBlock.attrs',
        },
      ],
    },
    {
      type: 'row',
      if: 'TextSecondary.show',
      styleBindings: {
        margin: 'TextSecondary.margin',
      },
      children: [
        {
          type: 'text',
          group: groups.textSecondary.id,
          value: 'TextSecondary.value',
          attrs: 'TextSecondary.attrs',
        },
      ],
    },
    {
      type: 'row',
      if: 'Button.show',
      children: [
        {
          type: 'button',
          group: groups.button.id,
          align: 'Button.align',
          attrs: 'Button.attrs',
          text: 'Button.text',
        },
      ],
    },
  ],
})

const headerWithGridSchema = defineEmailBlockSchema<HeaderWithGridSchemaModel>({
  ...headerRoot,
  nodes: [
    {
      type: 'row',
      children: [
        {
          type: 'logo',
          group: groups.logo.id,
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
          group: groups.imageMain.id,
          link: 'Image.link',
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
          group: groups.textMain.id,
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
          group: groups.imageBlock.id,
          link: 'ImageBlock.link',
          value: 'ImageBlock.value',
          attrs: 'ImageBlock.attrs',
        },
      ],
    },
    {
      type: 'row',
      if: 'TextSecondary.show',
      styleBindings: {
        margin: 'TextSecondary.margin',
      },
      children: [
        {
          type: 'text',
          group: groups.textSecondary.id,
          value: 'TextSecondary.value',
          attrs: 'TextSecondary.attrs',
        },
      ],
    },
    {
      type: 'row',
      if: 'Grid.show',
      styleBindings: {
        margin: 'Grid.margin',
      },
      children: [
        {
          type: 'grid',
          group: groups.grid.id,
          items: 'Grid.items',
          align: 'Grid.align',
          gap: 'Grid.gap',
          width: 'Grid.width',
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
        value: 'center',
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
      f.spacing({
        group: groups.textMain,
        value: {
          margin: [30, 0, 0, 0],
          padding: [45, 20, 16, 20],
        },
      }),
      f.mainColor({
        group: groups.textMain,
        value: COLOR.theme.light,
      }),
      f.content({
        group: groups.textMain,
        value:
          '<p style="text-align: center"><span style="font-size: 36px"><strong>Don\'t Lose<br/>Yourself.</strong></span></p><p style="text-align: center"><span style="font-size: 18px">New album</span></p>',
      }),
      f.backgroundImage({
        group: groups.textMain,
        value: {
          url: '/img/bosco-shots-ZoEdO0G0xmI-unsplash.png',
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
      f.align({
        group: groups.button,
        value: 'center',
      }),
      f.spacing({
        group: groups.button,
        value: {
          margin: [40, 0, 40, 0],
          padding: [12, 24, 12, 24],
        },
      }),
      f.backgroundColor({
        group: groups.button,
        value: '#3494FB',
      }),
      f.color({
        group: groups.button,
        value: COLOR.theme.light,
      }),
      f.input({
        group: groups.button,
        key: 'text',
        label: 'Text',
        value: 'Download',
      }),
      f.input({
        group: groups.button,
        key: 'link',
        label: 'Link',
        value: 'https://example.com',
      }),
      f.inputNumber({
        group: groups.button,
        key: 'borderRadius',
        label: 'Border Radius',
        value: 5,
      }),
      f.inputNumber({
        group: groups.button,
        key: 'fontSize',
        label: 'Font Size',
        value: 14,
      }),
      f.showHide({
        group: groups.button,
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
        value: 'center',
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
      f.spacing({
        group: groups.imageMain,
        value: {
          margin: [20, 0, 0, 0],
        },
      }),
      f.backgroundImage({
        group: groups.imageMain,
        value: {
          url: '/img/johannes-andersson-v5gGwubKzEA-unsplash.jpg',
          position: 'center',
          repeat: 'no-repeat',
          size: 'cover',
        },
      }),
      f.inputNumber({
        group: groups.imageMain,
        key: 'height',
        label: 'Height',
        value: 296,
      }),
      f.inputNumber({
        group: groups.imageMain,
        key: 'borderRadius',
        label: 'Border Radius',
        value: 5,
      }),
      f.input({
        group: groups.imageMain,
        key: 'link',
        label: 'Link',
        value: 'https://example.com',
      }),
      f.showHide({
        group: groups.imageMain,
      }),
      f.spacing({
        group: groups.textMain,
        value: {
          margin: [10, 0, 0, 0],
          padding: [0, 0, 0, 0],
        },
      }),
      f.mainColor({
        group: groups.textMain,
        value: COLOR.theme.dark,
      }),
      f.content({
        group: groups.textMain,
        value:
          '<p style="text-align: center"><span style="font-size: 18px; color: #9CA3AF">Surfing Season \'19</span></p><p style="text-align: center"><span style="font-size: 32px"><strong>There\'s Change<br/>In The Air.<br/>Can You Feel It?</strong></span></p>',
      }),
      f.showHide({
        group: groups.textMain,
      }),
      f.align({
        group: groups.button,
        value: 'center',
      }),
      f.spacing({
        group: groups.button,
        value: {
          margin: [20, 0, 0, 0],
          padding: [12, 24, 12, 24],
        },
      }),
      f.backgroundColor({
        group: groups.button,
        value: '#4A98ED',
      }),
      f.color({
        group: groups.button,
        value: COLOR.theme.light,
      }),
      f.input({
        group: groups.button,
        key: 'text',
        label: 'Text',
        value: 'Take Part',
      }),
      f.input({
        group: groups.button,
        key: 'link',
        label: 'Link',
        value: 'https://example.com',
      }),
      f.inputNumber({
        group: groups.button,
        key: 'borderRadius',
        label: 'Border Radius',
        value: 5,
      }),
      f.inputNumber({
        group: groups.button,
        key: 'fontSize',
        label: 'Font Size',
        value: 14,
      }),
      f.showHide({
        group: groups.button,
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
        value: 'center',
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
      f.spacing({
        group: groups.textMain,
        value: {
          margin: [30, 0, 0, 0],
          padding: [0, 0, 0, 0],
        },
      }),
      f.mainColor({
        group: groups.textMain,
        value: '#000000',
      }),
      f.content({
        group: groups.textMain,
        value:
          '<p style="text-align: center"><span style="color: rgb(124, 134, 199); font-size: 18px">New series</span></p><p style="text-align: center"><strong><span style="font-size: 32px">The loop by loop.</span></strong></p>',
      }),
      f.showHide({
        group: groups.textMain,
      }),
      f.spacing({
        group: groups.imageBlock,
        value: {
          margin: [20, 0, 0, 0],
        },
      }),
      f.backgroundImage({
        group: groups.imageBlock,
        value: {
          url: '/img/apple-watch-2.png',
          position: 'center',
          repeat: 'no-repeat',
          size: 'contain',
        },
      }),
      f.inputNumber({
        group: groups.imageBlock,
        key: 'height',
        label: 'Height',
        value: 300,
      }),
      f.inputNumber({
        group: groups.imageBlock,
        key: 'borderRadius',
        label: 'Border Radius',
        value: 0,
      }),
      f.input({
        group: groups.imageBlock,
        key: 'link',
        label: 'Link',
        value: 'https://example.com',
      }),
      f.showHide({
        group: groups.imageBlock,
      }),
      f.spacing({
        group: groups.textSecondary,
        value: {
          margin: [20, 0, 0, 0],
          padding: [0, 0, 0, 0],
        },
      }),
      f.mainColor({
        group: groups.textSecondary,
        value: '#A9ADB3',
      }),
      f.content({
        group: groups.textSecondary,
        value:
          '<p style="text-align: center"><span style="font-size: 18px">With our latest model of watch,<br>you\'ll get the most amazing features<br>for your everyday workout.</span></p>',
      }),
      f.showHide({
        group: groups.textSecondary,
      }),
      f.align({
        group: groups.button,
        value: 'center',
      }),
      f.spacing({
        group: groups.button,
        value: {
          margin: [20, 0, 20, 0],
          padding: [12, 24, 12, 24],
        },
      }),
      f.backgroundColor({
        group: groups.button,
        value: '#4A98ED',
      }),
      f.color({
        group: groups.button,
        value: COLOR.theme.light,
      }),
      f.input({
        group: groups.button,
        key: 'text',
        label: 'Text',
        value: 'Take Yours',
      }),
      f.input({
        group: groups.button,
        key: 'link',
        label: 'Link',
        value: 'https://example.com',
      }),
      f.inputNumber({
        group: groups.button,
        key: 'borderRadius',
        label: 'Border Radius',
        value: 5,
      }),
      f.inputNumber({
        group: groups.button,
        key: 'fontSize',
        label: 'Font Size',
        value: 14,
      }),
      f.showHide({
        group: groups.button,
      }),
    ],
  }
}

const header6: ComponentBuilder = (_, label) => {
  return {
    id: nanoid(8),
    name: 'Header6',
    label,
    schema: headerWithGridSchema,
    type: 'header',
    preview: images.components.header6,
    tools: [
      f.spacing({
        group: groups.layout,
        value: {
          padding: [30, 35, 40, 35],
        },
      }),
      f.backgroundColor({
        group: groups.layout,
        value: '#FFFFFF',
      }),
      f.align({
        group: groups.logo,
        value: 'center',
      }),
      f.image({
        group: groups.logo,
        value: {
          src: images.logo.black,
          link: 'https://example.com',
          alt: 'MySigMail',
          width: 128,
        },
      }),
      f.showHide({
        group: groups.logo,
      }),
      f.spacing({
        group: groups.imageMain,
        value: {
          margin: [36, 0, 0, 0],
        },
      }),
      f.backgroundImage({
        group: groups.imageMain,
        value: {
          url: '/img/app-icon.png',
          position: 'center',
          repeat: 'no-repeat',
          size: 'contain',
        },
      }),
      f.inputNumber({
        group: groups.imageMain,
        key: 'height',
        label: 'Height',
        value: 100,
      }),
      f.inputNumber({
        group: groups.imageMain,
        key: 'borderRadius',
        label: 'Border Radius',
        value: 0,
      }),
      f.input({
        group: groups.imageMain,
        key: 'link',
        label: 'Link',
        value: 'https://example.com',
      }),
      f.showHide({
        group: groups.imageMain,
      }),
      f.spacing({
        group: groups.textMain,
        value: {
          margin: [0, 0, 0, 0],
        },
      }),
      f.mainColor({
        group: groups.textMain,
        value: '#000000',
      }),
      f.content({
        group: groups.textMain,
        value:
          '<p style="text-align: center"><span style="color: rgb(124, 134, 199); font-size: 16px">Brand new</span></p><p style="text-align: center"><strong><span style="font-size: 32px">The Circle.</span></strong></p>',
      }),
      f.showHide({
        group: groups.textMain,
      }),
      f.spacing({
        group: groups.imageBlock,
        value: {
          margin: [24, 0, 0, 0],
        },
      }),
      f.backgroundImage({
        group: groups.imageBlock,
        value: {
          url: '/img/iphone-angle.jpg',
          position: 'center',
          repeat: 'no-repeat',
          size: 'contain',
        },
      }),
      f.inputNumber({
        group: groups.imageBlock,
        key: 'height',
        label: 'Height',
        value: 185,
      }),
      f.inputNumber({
        group: groups.imageBlock,
        key: 'borderRadius',
        label: 'Border Radius',
        value: 0,
      }),
      f.input({
        group: groups.imageBlock,
        key: 'link',
        label: 'Link',
        value: 'https://example.com',
      }),
      f.showHide({
        group: groups.imageBlock,
      }),
      f.spacing({
        group: groups.textSecondary,
        value: {
          margin: [0, 0, 0, 0],
        },
      }),
      f.mainColor({
        group: groups.textSecondary,
        value: '#9FA3A7',
      }),
      f.content({
        group: groups.textSecondary,
        value:
          '<p style="text-align: center"><span style="font-size: 18px">GPS tracker for running and fitness.<br/>Unique features used by professional athletes<br/>are now also available for beginners!</span></p>',
      }),
      f.showHide({
        group: groups.textSecondary,
      }),
      f.spacing({
        group: groups.grid,
        value: {
          margin: [22, 0, 22, 0],
        },
      }),
      f.inputNumber({
        group: groups.grid,
        key: 'gap',
        label: 'Gap',
        value: 12,
      }),
      f.grid({
        group: groups.grid,
        value: [
          f.gridItem({
            tools: [
              f.align({
                value: 'right',
              }),
              f.image({
                value: {
                  src: '/img/app-store.png',
                  alt: 'Download on the App Store',
                  width: 150,
                },
              }),
            ],
          }),
          f.gridItem({
            tools: [
              f.align({
                value: 'left',
              }),
              f.image({
                value: {
                  src: '/img/google-play.png',
                  alt: 'Get it on Google Play',
                  width: 150,
                },
              }),
            ],
          }),
        ],
      }),
      f.showHide({
        group: groups.grid,
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
  header6('light', 'Header 6'),
]
