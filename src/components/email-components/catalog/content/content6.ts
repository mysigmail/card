import type { ComponentBuilder } from '@/types/editor'
import { nanoid } from 'nanoid'
import { images } from '@/components/email-components/catalog/images'
import { composeEmailBlock, grid, row, text } from '@/components/email-components/composition'
import { f } from '@/components/email-components/fields'

function logoGridItem(src: string, alt: string, link: string) {
  return f.gridItem({
    tools: [
      f.align({
        value: 'center',
      }),
      f.image({
        value: {
          src,
          link,
          alt,
          width: 130,
        },
      }),
    ],
  })
}

const content6Composition = composeEmailBlock({
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
    text: ['show', 'margin', 'value', 'attrs'],
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
      value: '#222222',
    }),
    f.spacing({
      group: groups.text,
      value: {
        margin: [0, 0, 8, 0],
      },
    }),
    f.mainColor({
      group: groups.text,
      value: '#FFFFFF',
    }),
    f.content({
      group: groups.text,
      value:
        '<p style="text-align: center"><strong><span style="font-size: 32px">Our Clients</span></strong></p><p style="text-align: center"><span style="color: rgb(159, 163, 167); font-size: 16px">We&rsquo;re trusted by well-known companies,</span><br><span style="color: rgb(159, 163, 167); font-size: 14px">and here are some of them.</span></p>',
    }),
    f.showHide({
      group: groups.text,
    }),
    f.spacing({
      group: groups.rowOneGrid,
      value: {
        margin: [0, 0, 10, 0],
      },
    }),
    f.inputNumber({
      group: groups.rowOneGrid,
      key: 'gap',
      label: 'Gap',
      value: 6,
    }),
    f.grid({
      group: groups.rowOneGrid,
      value: [
        logoGridItem('/img/apple.png', 'Apple', 'https://www.apple.com'),
        logoGridItem('/img/google.png', 'Google', 'https://www.google.com'),
        logoGridItem('/img/xbox.png', 'Xbox', 'https://www.xbox.com'),
        logoGridItem('/img/spotify.png', 'Spotify', 'https://www.spotify.com'),
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
      value: 6,
    }),
    f.grid({
      group: groups.rowTwoGrid,
      value: [
        logoGridItem('/img/bose.png', 'Bose', 'https://www.bose.com'),
        logoGridItem('/img/microsoft.png', 'Microsoft', 'https://www.microsoft.com'),
        logoGridItem('/img/coca-cola.png', 'Coca-Cola', 'https://www.coca-cola.com'),
        logoGridItem('/img/facebook.png', 'Facebook', 'https://www.facebook.com'),
      ],
    }),
    f.showHide({
      group: groups.rowTwoGrid,
    }),
  ],
})

export const content6: ComponentBuilder = (_, label) => {
  return {
    id: nanoid(8),
    name: 'Content6',
    label,
    schema: content6Composition.schema,
    type: 'content',
    preview: images.components.content6,
    tools: content6Composition.createTools(),
  }
}
