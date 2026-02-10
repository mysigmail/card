import type { ComponentBuilder } from '@/types/editor'
import { nanoid } from 'nanoid'
import { images } from '@/components/email-components/catalog/images'
import { composeEmailBlock, row, text } from '@/components/email-components/composition'
import { f } from '@/components/email-components/fields'

const content4Composition = composeEmailBlock({
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
  } as const,
  fields: {
    layout: ['attrs'],
    text: ['show', 'margin', 'value', 'attrs'],
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
      value: '#111111',
    }),
    f.content({
      group: groups.text,
      value:
        '<p style="text-align: center"><span style="color: rgb(159, 163, 167); font-size: 14px">12 July \'19</span></p><p style="text-align: center"><strong><span style="font-size: 24px">How to Stick to Your Fitness Habits the Easy</span></strong><br><strong><span style="font-size: 24px">Way, According to Science</span></strong></p><p style="text-align: center"><span style="color: rgb(159, 163, 167); font-size: 14px">Staying in shape is mostly about program compliance: it&rsquo;s not about having</span><br><span style="color: rgb(159, 163, 167); font-size: 14px">the best fitness program, but about having one that&rsquo;s good enough, and</span><br><span style="color: rgb(159, 163, 167); font-size: 14px">making sure you actually stick to it.</span></p>',
    }),
    f.showHide({
      group: groups.text,
    }),
  ],
})

export const content4: ComponentBuilder = (_, label) => {
  return {
    id: nanoid(8),
    name: 'Content4',
    label,
    schema: content4Composition.schema,
    type: 'content',
    preview: images.components.content4,
    tools: content4Composition.createTools(),
  }
}
