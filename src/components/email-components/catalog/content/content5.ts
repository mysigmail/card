import type { ComponentBuilder } from '@/types/editor'
import { nanoid } from 'nanoid'
import { images } from '@/components/email-components/catalog/images'
import { composeEmailBlock, image, row, text } from '@/components/email-components/composition'
import { f } from '@/components/email-components/fields'

const content5Composition = composeEmailBlock({
  groups: {
    layout: {
      role: 'layout',
      id: 'Layout',
      label: 'Layout',
    },
    text: {
      role: 'text',
      id: 'Text',
      label: 'Text',
    },
    image: {
      role: 'image',
      id: 'Image',
      label: 'Image',
    },
    textSecondary: {
      role: 'text',
      id: 'TextSecondary',
      label: 'Secondary Text',
    },
  } as const,
  fields: {
    layout: ['attrs'],
    text: ['show', 'margin', 'value', 'attrs'],
    image: ['show', 'margin', 'attrs', 'link', 'align', 'width'],
    textSecondary: ['show', 'margin', 'value', 'attrs'],
  } as const,
  schema: ({ groups, path }) => ({
    root: {
      attrs: path('layout', 'attrs'),
      clickGroup: groups.layout.id,
    },
    nodes: [
      row({
        if: path('text', 'show'),
        styleBindings: {
          margin: path('text', 'margin'),
        },
        children: [
          text({
            group: groups.text.id,
            value: path('text', 'value'),
            attrs: path('text', 'attrs'),
          }),
        ],
      }),
      row({
        if: path('image', 'show'),
        styleBindings: {
          margin: path('image', 'margin'),
        },
        children: [
          image({
            group: groups.image.id,
            attrs: path('image', 'attrs'),
            link: path('image', 'link'),
            align: path('image', 'align'),
            width: path('image', 'width'),
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
      value: '#FFFFFF',
    }),
    f.spacing({
      group: groups.text,
      value: {
        margin: [0, 0, 0, 0],
      },
    }),
    f.mainColor({
      group: groups.text,
      value: '#9FA3A7',
    }),
    f.content({
      group: groups.text,
      value:
        '<p style="text-align: center"><span style="font-size: 14px">Staying in shape is mostly about program compliance: it&rsquo;s not about having</span><br><span style="font-size: 14px">the best fitness program, but about having one that&rsquo;s good enough, and</span><br><span style="font-size: 14px">making sure you actually stick to it.</span></p>',
    }),
    f.showHide({
      group: groups.text,
    }),
    f.spacing({
      group: groups.image,
      value: {
        margin: [0, 0, 0, 0],
      },
    }),
    f.align({
      group: groups.image,
      value: 'center',
    }),
    f.image({
      group: groups.image,
      value: {
        src: '/img/jack-finnigan-rriAI0nhcbc-unsplash.jpg',
        link: 'https://example.com',
        alt: 'Mike Brown',
        width: 80,
        height: 80,
      },
    }),
    f.inputNumber({
      group: groups.image,
      key: 'borderRadius',
      label: 'Border Radius',
      value: 60,
    }),
    f.showHide({
      group: groups.image,
    }),
    f.spacing({
      group: groups.textSecondary,
      value: {
        margin: [0, 0, 0, 0],
      },
    }),
    f.mainColor({
      group: groups.textSecondary,
      value: '#111111',
    }),
    f.content({
      group: groups.textSecondary,
      value:
        '<p style="text-align: center"><strong><span style="font-size: 18px">Mike Brown</span></strong><br><span style="color: rgb(159, 163, 167); font-size: 14px">Fitness Trainer</span></p>',
    }),
    f.showHide({
      group: groups.textSecondary,
    }),
  ],
})

export const content5: ComponentBuilder = (_, label) => {
  return {
    id: nanoid(8),
    name: 'Content5',
    label,
    schema: content5Composition.schema,
    type: 'content',
    preview: images.components.content5,
    tools: content5Composition.createTools(),
  }
}
