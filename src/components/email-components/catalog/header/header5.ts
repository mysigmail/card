import type { ComponentBuilder } from '@/types/editor'
import { nanoid } from 'nanoid'
import { images } from '@/components/email-components/catalog/images'
import { composeEmailBlock, image, row, text } from '@/components/email-components/composition'
import { COLOR } from '@/components/email-components/constants'
import { f } from '@/components/email-components/fields'

const header5Composition = composeEmailBlock({
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
    textMain: {
      role: 'text',
      id: 'Text',
      label: 'Text',
    },
    imageBlock: {
      role: 'imageBlock',
      id: 'ImageBlock',
      label: 'Image Block',
    },
    textSecondary: {
      role: 'text',
      id: 'TextSecondary',
      label: 'Secondary Text',
    },
    button: {
      role: 'button',
      id: 'Button',
      label: 'Button',
    },
  } as const,
  fields: {
    layout: ['attrs'],
    logo: ['show', 'attrs', 'link', 'align', 'width'],
    textMain: ['show', 'margin', 'value', 'attrs'],
    imageBlock: ['show', 'margin', 'value', 'attrs', 'link'],
    textSecondary: ['show', 'margin', 'value', 'attrs'],
    button: ['show', 'align', 'attrs', 'text'],
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
      row({
        if: path('imageBlock', 'show'),
        styleBindings: {
          margin: path('imageBlock', 'margin'),
        },
        children: [
          text({
            group: groups.imageBlock.id,
            link: path('imageBlock', 'link'),
            value: path('imageBlock', 'value'),
            attrs: path('imageBlock', 'attrs'),
          }),
        ],
      }),
      row({
        if: path('textSecondary', 'show'),
        styleBindings: {
          margin: path('textSecondary', 'margin'),
        },
        children: [
          text({
            group: groups.textSecondary.id,
            value: path('textSecondary', 'value'),
            attrs: path('textSecondary', 'attrs'),
          }),
        ],
      }),
      row({
        if: path('button', 'show'),
        children: [
          {
            type: 'button',
            group: groups.button.id,
            align: path('button', 'align'),
            attrs: path('button', 'attrs'),
            text: path('button', 'text'),
          },
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
})

export const header5: ComponentBuilder = (_, label) => {
  return {
    id: nanoid(8),
    name: 'Header5',
    label,
    schema: header5Composition.schema,
    type: 'header',
    preview: images.components.header5,
    tools: header5Composition.createTools(),
  }
}
