import type { ComponentBuilder } from '@/types/editor'
import { nanoid } from 'nanoid'
import { images } from '@/components/email-components/catalog/images'
import {
  composeEmailBlock,
  grid,
  image,
  row,
  text,
} from '@/components/email-components/composition'
import { f } from '@/components/email-components/fields'

const header6Composition = composeEmailBlock({
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
    imageMain: {
      role: 'imageBlock',
      id: 'Image',
      label: 'Image',
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
    grid: {
      role: 'grid',
      id: 'Grid',
      label: 'Grid',
    },
  } as const,
  fields: {
    layout: ['attrs'],
    logo: ['show', 'attrs', 'link', 'align', 'width'],
    imageMain: ['show', 'margin', 'value', 'attrs', 'link'],
    textMain: ['show', 'margin', 'value', 'attrs'],
    imageBlock: ['show', 'margin', 'value', 'attrs', 'link'],
    textSecondary: ['show', 'margin', 'value', 'attrs'],
    grid: ['show', 'margin', 'items', 'align', 'width', 'gap'],
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
        if: path('imageMain', 'show'),
        styleBindings: {
          margin: path('imageMain', 'margin'),
        },
        children: [
          text({
            group: groups.imageMain.id,
            link: path('imageMain', 'link'),
            value: path('imageMain', 'value'),
            attrs: path('imageMain', 'attrs'),
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
        if: path('grid', 'show'),
        styleBindings: {
          margin: path('grid', 'margin'),
        },
        children: [
          grid({
            group: groups.grid.id,
            items: path('grid', 'items'),
            align: path('grid', 'align'),
            gap: path('grid', 'gap'),
            width: path('grid', 'width'),
          }),
        ],
      }),
    ],
  }),
  tools: ({ groups }) => [
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
})

export const header6: ComponentBuilder = (_, label) => {
  return {
    id: nanoid(8),
    name: 'Header6',
    label,
    schema: header6Composition.schema,
    type: 'header',
    preview: images.components.header6,
    tools: header6Composition.createTools(),
  }
}
