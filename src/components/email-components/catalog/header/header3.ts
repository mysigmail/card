import type { ComponentBuilder } from '@/types/editor'
import { nanoid } from 'nanoid'
import { images } from '@/components/email-components/catalog/images'
import { composeEmailBlock, image, row, text } from '@/components/email-components/composition'
import { COLOR } from '@/components/email-components/constants'
import { f } from '@/components/email-components/fields'

const header3Composition = composeEmailBlock({
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
            children: [
              {
                type: 'button',
                group: groups.button.id,
                if: path('button', 'show'),
                align: path('button', 'align'),
                attrs: path('button', 'attrs'),
                text: path('button', 'text'),
              },
            ],
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
})

export const header3: ComponentBuilder = (_, label) => {
  return {
    id: nanoid(8),
    name: 'Header3',
    label,
    schema: header3Composition.schema,
    type: 'header',
    preview: images.components.header3,
    tools: header3Composition.createTools(),
  }
}
