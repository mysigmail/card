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

function imageGridItem(url: string, link: string) {
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

const content2Composition = composeEmailBlock({
  groups: {
    layout: {
      role: 'layout',
      id: 'Layout',
      label: 'Layout',
    },
    textGrid: {
      role: 'grid',
      id: 'TextGrid',
      label: 'Text Grid',
    },
    imageGrid: {
      role: 'grid',
      id: 'ImageGrid',
      label: 'Image Grid',
    },
  } as const,
  fields: {
    layout: ['attrs'],
    textGrid: ['show', 'margin', 'items', 'align', 'width', 'gap'],
    imageGrid: ['show', 'margin', 'items', 'align', 'width', 'gap'],
  } as const,
  schema: ({ groups, path }) => ({
    root: {
      attrs: path('layout', 'attrs'),
      clickGroup: groups.layout.id,
    },
    nodes: [
      row({
        if: path('textGrid', 'show'),
        styleBindings: {
          margin: path('textGrid', 'margin'),
        },
        children: [
          grid({
            group: groups.textGrid.id,
            items: path('textGrid', 'items'),
            align: path('textGrid', 'align'),
            gap: path('textGrid', 'gap'),
            width: path('textGrid', 'width'),
          }),
        ],
      }),
      row({
        if: path('imageGrid', 'show'),
        styleBindings: {
          margin: path('imageGrid', 'margin'),
        },
        children: [
          grid({
            group: groups.imageGrid.id,
            items: path('imageGrid', 'items'),
            align: path('imageGrid', 'align'),
            gap: path('imageGrid', 'gap'),
            width: path('imageGrid', 'width'),
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
      group: groups.textGrid,
      value: {
        margin: [0, 0, 12, 0],
      },
    }),
    f.inputNumber({
      group: groups.textGrid,
      key: 'gap',
      label: 'Gap',
      value: 20,
    }),
    f.grid({
      group: groups.textGrid,
      value: [
        f.gridItem({
          tools: [
            f.content({
              value:
                '<p style="text-align: left"><span style="color: rgb(159, 163, 167); font-size: 14px">12 July \'19</span></p><p style="text-align: left"><strong><span style="font-size: 24px">How Music Affects</span></strong><br><strong><span style="font-size: 24px">Your Productivity</span></strong></p>',
            }),
          ],
        }),
        f.gridItem({
          tools: [
            f.content({
              value:
                '<p style="text-align: left"><span style="color: rgb(159, 163, 167); font-size: 14px">12 July \'19</span></p><p style="text-align: left"><strong><span style="font-size: 24px">Background Music for</span></strong><br><strong><span style="font-size: 24px">Coding</span></strong></p>',
            }),
          ],
        }),
      ],
    }),
    f.showHide({
      group: groups.textGrid,
    }),
    f.spacing({
      group: groups.imageGrid,
      value: {
        margin: [0, 0, 0, 0],
      },
    }),
    f.inputNumber({
      group: groups.imageGrid,
      key: 'gap',
      label: 'Gap',
      value: 20,
    }),
    f.grid({
      group: groups.imageGrid,
      value: [
        imageGridItem('/img/juja-han-HU-uL54pfQI-unsplash.jpg', 'https://example.com'),
        imageGridItem('/img/jefferson-santos-9SoCnyQmkzI-unsplash.jpg', 'https://example.com'),
      ],
    }),
    f.showHide({
      group: groups.imageGrid,
    }),
  ],
})

export const content2: ComponentBuilder = (_, label) => {
  return {
    id: nanoid(8),
    name: 'Content2',
    label,
    schema: content2Composition.schema,
    type: 'content',
    preview: images.components.content2,
    tools: content2Composition.createTools(),
  }
}
