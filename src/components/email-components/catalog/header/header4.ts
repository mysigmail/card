import type { ComponentBuilder } from '@/types/editor'
import { nanoid } from 'nanoid'
import { images } from '@/components/email-components/catalog/images'
import { composeEmailBlock, image, row, text } from '@/components/email-components/composition'
import { COLOR } from '@/components/email-components/constants'
import { f } from '@/components/email-components/fields'

const header4Composition = composeEmailBlock({
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
    button: {
      role: 'button',
      id: 'Button',
      label: 'Button',
    },
  } as const,
  fields: {
    layout: ['attrs'],
    logo: ['show', 'attrs', 'link', 'align', 'width'],
    imageMain: ['show', 'margin', 'value', 'attrs', 'link'],
    textMain: ['show', 'margin', 'value', 'attrs'],
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
})

export const header4: ComponentBuilder = (_, label) => {
  return {
    id: nanoid(8),
    name: 'Header4',
    label,
    schema: header4Composition.schema,
    type: 'header',
    preview: images.components.header4,
    tools: header4Composition.createTools(),
  }
}
