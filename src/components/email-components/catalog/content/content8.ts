import type { ComponentBuilder } from '@/types/editor'
import { nanoid } from 'nanoid'
import { images } from '@/components/email-components/catalog/images'
import { composeEmailBlock, grid, row } from '@/components/email-components/composition'
import { f } from '@/components/email-components/fields'

function imageBlockPlaceholder(height: number) {
  const normalizedHeight = Math.max(0, Number(height))
  const minHeight = `${normalizedHeight}px`

  return `<span style="display:block;min-height:${minHeight};line-height:${minHeight};font-size:0;">&nbsp;</span>`
}

function imageBlockGridItem(url: string, link: string) {
  return f.gridItem({
    tools: [
      f.content({
        value: imageBlockPlaceholder(200),
      }),
      f.backgroundImage({
        value: {
          url,
          position: 'center',
          repeat: 'no-repeat',
          size: 'cover',
        },
      }),
      f.inputNumber({
        key: 'borderRadius',
        label: 'Border Radius',
        value: 5,
      }),
      f.input({
        key: 'link',
        label: 'Link',
        value: link,
      }),
    ],
  })
}

function textGridItem(titleLine1: string, titleLine2: string, description: string) {
  return f.gridItem({
    tools: [
      f.verticalAlign({
        value: 'top',
      }),
      f.content({
        value: `<p style="text-align: left"><span style="color: rgb(159, 163, 167); font-size: 14px">12 July '19</span></p><p style="text-align: left"><strong><span style="font-size: 24px">${titleLine1}</span></strong><br><strong><span style="font-size: 24px">${titleLine2}</span></strong></p><p style="text-align: left"><span style="color: rgb(159, 163, 167); font-size: 14px">${description}</span></p>`,
      }),
    ],
  })
}

const content8Composition = composeEmailBlock({
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
  } as const,
  fields: {
    layout: ['attrs'],
    rowOneGrid: ['show', 'margin', 'items', 'align', 'width', 'gap'],
    rowTwoGrid: ['show', 'margin', 'items', 'align', 'width', 'gap'],
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
        margin: [0, 0, 20, 0],
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
        imageBlockGridItem('/img/juja-han-HU-uL54pfQI-unsplash.jpg', 'https://example.com'),
        textGridItem(
          'How Music Affects',
          'Your Productivity',
          'Music is regarded as one of the triumphs of human creativity.',
        ),
      ],
    }),
    f.showHide({
      group: groups.rowOneGrid,
    }),
    f.spacing({
      group: groups.rowTwoGrid,
      value: {
        margin: [0, 0, 0, 0],
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
        textGridItem(
          'Background Music for',
          'Coding',
          'Do you guys use background music while coding?',
        ),
        imageBlockGridItem('/img/jefferson-santos-9SoCnyQmkzI-unsplash.jpg', 'https://example.com'),
      ],
    }),
    f.showHide({
      group: groups.rowTwoGrid,
    }),
  ],
})

export const content8: ComponentBuilder = (_, label) => {
  return {
    id: nanoid(8),
    name: 'Content8',
    label,
    schema: content8Composition.schema,
    type: 'content',
    preview: images.components.content8,
    tools: content8Composition.createTools(),
  }
}
