import type { ComponentBuilder } from '@/types/editor'
import { nanoid } from 'nanoid'
import { images } from '@/components/email-components/catalog/images'
import { composeEmailBlock, grid, row } from '@/components/email-components/composition'
import { f } from '@/components/email-components/fields'

function topTextGridItem(value: string) {
  return f.gridItem({
    tools: [
      f.verticalAlign({
        value: 'top',
      }),
      f.content({
        value: `<p style="text-align: center"><span style="color: rgb(159, 163, 167); font-size: 14px">${value}</span></p>`,
      }),
    ],
  })
}

function imageGridItem(image: string, name: string) {
  return f.gridItem({
    tools: [
      f.align({
        value: 'center',
      }),
      f.image({
        value: {
          src: image,
          link: 'https://example.com',
          alt: name,
          width: 80,
          height: 80,
        },
      }),
      f.inputNumber({
        key: 'borderRadius',
        label: 'Border Radius',
        value: 60,
      }),
    ],
  })
}

function bottomTextGridItem(name: string, role: string) {
  return f.gridItem({
    tools: [
      f.verticalAlign({
        value: 'top',
      }),
      f.content({
        value: `<p style="text-align: center"><strong><span style="font-size: 18px">${name}</span></strong><br><span style="color: rgb(159, 163, 167); font-size: 14px">${role}</span></p>`,
      }),
    ],
  })
}

const content9Composition = composeEmailBlock({
  groups: {
    layout: {
      role: 'layout',
      id: 'Layout',
      label: 'Layout',
    },
    rowOneGrid: {
      role: 'grid',
      id: 'RowOneGrid',
      label: 'Row 1 Grid',
    },
    rowTwoGrid: {
      role: 'grid',
      id: 'RowTwoGrid',
      label: 'Row 2 Grid',
    },
    rowThreeGrid: {
      role: 'grid',
      id: 'RowThreeGrid',
      label: 'Row 3 Grid',
    },
  } as const,
  fields: {
    layout: ['attrs'],
    rowOneGrid: ['show', 'margin', 'items', 'align', 'width', 'gap'],
    rowTwoGrid: ['show', 'margin', 'items', 'align', 'width', 'gap'],
    rowThreeGrid: ['show', 'margin', 'items', 'align', 'width', 'gap'],
  } as const,
  schema: ({ groups, path }) => ({
    root: {
      attrs: path('layout', 'attrs'),
      clickGroup: groups.layout.id,
    },
    nodes: [
      row({
        if: path('rowOneGrid', 'show'),
        styleBindings: {
          margin: path('rowOneGrid', 'margin'),
        },
        children: [
          grid({
            group: groups.rowOneGrid.id,
            items: path('rowOneGrid', 'items'),
            align: path('rowOneGrid', 'align'),
            gap: path('rowOneGrid', 'gap'),
            width: path('rowOneGrid', 'width'),
          }),
        ],
      }),
      row({
        if: path('rowTwoGrid', 'show'),
        styleBindings: {
          margin: path('rowTwoGrid', 'margin'),
        },
        children: [
          grid({
            group: groups.rowTwoGrid.id,
            items: path('rowTwoGrid', 'items'),
            align: path('rowTwoGrid', 'align'),
            gap: path('rowTwoGrid', 'gap'),
            width: path('rowTwoGrid', 'width'),
          }),
        ],
      }),
      row({
        if: path('rowThreeGrid', 'show'),
        styleBindings: {
          margin: path('rowThreeGrid', 'margin'),
        },
        children: [
          grid({
            group: groups.rowThreeGrid.id,
            items: path('rowThreeGrid', 'items'),
            align: path('rowThreeGrid', 'align'),
            gap: path('rowThreeGrid', 'gap'),
            width: path('rowThreeGrid', 'width'),
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
      group: groups.rowOneGrid,
      value: {
        margin: [0, 0, 8, 0],
      },
    }),
    f.inputNumber({
      group: groups.rowOneGrid,
      key: 'gap',
      label: 'Gap',
      value: 20,
    }),
    f.grid({
      group: groups.rowOneGrid,
      value: [
        topTextGridItem(
          'Staying in shape is mostly about program compliance: it&rsquo;s not about having the best fitness program, but about having one that&rsquo;s good enough, and making sure you actually stick to it.',
        ),
        topTextGridItem(
          'There&rsquo;s a common saying that willpower is like a muscle: it gets stronger when you use it. The truth is more complex. There&rsquo;s mixed evidence for how much people can really improve their self-control.',
        ),
      ],
    }),
    f.showHide({
      group: groups.rowOneGrid,
    }),
    f.spacing({
      group: groups.rowTwoGrid,
      value: {
        margin: [0, 0, 8, 0],
      },
    }),
    f.inputNumber({
      group: groups.rowTwoGrid,
      key: 'gap',
      label: 'Gap',
      value: 20,
    }),
    f.grid({
      group: groups.rowTwoGrid,
      value: [
        imageGridItem('/img/jack-finnigan-rriAI0nhcbc-unsplash.jpg', 'Mike Brown'),
        imageGridItem('/img/tamara-bellis-Mn1Uopx7if8-unsplash.jpg', 'Lina Muller'),
      ],
    }),
    f.showHide({
      group: groups.rowTwoGrid,
    }),
    f.spacing({
      group: groups.rowThreeGrid,
      value: {
        margin: [0, 0, 0, 0],
      },
    }),
    f.inputNumber({
      group: groups.rowThreeGrid,
      key: 'gap',
      label: 'Gap',
      value: 20,
    }),
    f.grid({
      group: groups.rowThreeGrid,
      value: [
        bottomTextGridItem('Mike Brown', 'Fitness Trainer'),
        bottomTextGridItem('Lina Muller', 'Bloger'),
      ],
    }),
    f.showHide({
      group: groups.rowThreeGrid,
    }),
  ],
})

export const content9: ComponentBuilder = (_, label) => {
  return {
    id: nanoid(8),
    name: 'Content9',
    label,
    schema: content9Composition.schema,
    type: 'content',
    preview: images.components.content9,
    tools: content9Composition.createTools(),
  }
}
