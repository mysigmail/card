import type { SchemaGroupFields } from '@/components/email-components/schema/types'
import { createSchemaGroups, gp } from '@/components/email-components/schema/groups'
import { defineEmailBlockSchema } from '@/components/email-components/schema/types'

interface ContentWithImageBlockSchemaModel {
  Layout: SchemaGroupFields<'attrs'>
  Text: SchemaGroupFields<'show' | 'margin' | 'value' | 'attrs'>
  ImageBlock: SchemaGroupFields<'show' | 'margin' | 'value' | 'attrs' | 'link'>
}

interface ContentTextOnlySchemaModel {
  Layout: SchemaGroupFields<'attrs'>
  Text: SchemaGroupFields<'show' | 'margin' | 'value' | 'attrs'>
}

interface ContentTextImageTextSchemaModel {
  Layout: SchemaGroupFields<'attrs'>
  Text: SchemaGroupFields<'show' | 'margin' | 'value' | 'attrs'>
  Image: SchemaGroupFields<'show' | 'margin' | 'attrs' | 'link' | 'align' | 'width'>
  TextSecondary: SchemaGroupFields<'show' | 'margin' | 'value' | 'attrs'>
}

interface ContentWithGridSchemaModel {
  Layout: SchemaGroupFields<'attrs'>
  TextGrid: SchemaGroupFields<'show' | 'margin' | 'items' | 'align' | 'width' | 'gap'>
  ImageGrid: SchemaGroupFields<'show' | 'margin' | 'items' | 'align' | 'width' | 'gap'>
}

interface ContentRowsGridSchemaModel {
  Layout: SchemaGroupFields<'attrs'>
  RowOneGrid: SchemaGroupFields<'show' | 'margin' | 'items' | 'align' | 'width' | 'gap'>
  RowTwoGrid: SchemaGroupFields<'show' | 'margin' | 'items' | 'align' | 'width' | 'gap'>
}

interface ContentTextRowsGridSchemaModel {
  Layout: SchemaGroupFields<'attrs'>
  Text: SchemaGroupFields<'show' | 'margin' | 'value' | 'attrs'>
  RowOneGrid: SchemaGroupFields<'show' | 'margin' | 'items' | 'align' | 'width' | 'gap'>
  RowTwoGrid: SchemaGroupFields<'show' | 'margin' | 'items' | 'align' | 'width' | 'gap'>
}

interface ContentThreeRowsGridSchemaModel {
  Layout: SchemaGroupFields<'attrs'>
  RowOneGrid: SchemaGroupFields<'show' | 'margin' | 'items' | 'align' | 'width' | 'gap'>
  RowTwoGrid: SchemaGroupFields<'show' | 'margin' | 'items' | 'align' | 'width' | 'gap'>
  RowThreeGrid: SchemaGroupFields<'show' | 'margin' | 'items' | 'align' | 'width' | 'gap'>
}

const groupBuilder = createSchemaGroups()

export const groups = {
  layout: groupBuilder.group('layout', { id: 'Layout', label: 'Layout' }),
  text: groupBuilder.group('text', { id: 'Text', label: 'Text' }),
  image: groupBuilder.group('image', { id: 'Image', label: 'Image' }),
  imageBlock: groupBuilder.group('imageBlock', { id: 'ImageBlock', label: 'Image Block' }),
  textSecondary: groupBuilder.group('text', { id: 'TextSecondary', label: 'Secondary Text' }),
  textGrid: groupBuilder.group('grid', { id: 'TextGrid', label: 'Text Grid' }),
  imageGrid: groupBuilder.group('grid', { id: 'ImageGrid', label: 'Image Grid' }),
  rowOneGrid: groupBuilder.group('grid', { id: 'RowOneGrid', label: 'Row 1 Grid' }),
  rowTwoGrid: groupBuilder.group('grid', { id: 'RowTwoGrid', label: 'Row 2 Grid' }),
  rowThreeGrid: groupBuilder.group('grid', { id: 'RowThreeGrid', label: 'Row 3 Grid' }),
} as const

const contentRoot = {
  attrs: gp(groups.layout, 'attrs'),
  clickGroup: groups.layout.id,
} as const

export const contentWithImageBlockSchema = defineEmailBlockSchema<ContentWithImageBlockSchemaModel>(
  {
    root: contentRoot,
    nodes: [
      {
        type: 'row',
        if: gp(groups.text, 'show'),
        styleBindings: {
          margin: gp(groups.text, 'margin'),
        },
        children: [
          {
            type: 'text',
            group: groups.text.id,
            value: gp(groups.text, 'value'),
            attrs: gp(groups.text, 'attrs'),
          },
        ],
      },
      {
        type: 'row',
        if: gp(groups.imageBlock, 'show'),
        styleBindings: {
          margin: gp(groups.imageBlock, 'margin'),
        },
        children: [
          {
            type: 'text',
            group: groups.imageBlock.id,
            link: gp(groups.imageBlock, 'link'),
            value: gp(groups.imageBlock, 'value'),
            attrs: gp(groups.imageBlock, 'attrs'),
          },
        ],
      },
    ],
  },
)

export const contentTextOnlySchema = defineEmailBlockSchema<ContentTextOnlySchemaModel>({
  root: contentRoot,
  nodes: [
    {
      type: 'row',
      if: gp(groups.text, 'show'),
      styleBindings: {
        margin: gp(groups.text, 'margin'),
      },
      children: [
        {
          type: 'text',
          group: groups.text.id,
          value: gp(groups.text, 'value'),
          attrs: gp(groups.text, 'attrs'),
        },
      ],
    },
  ],
})

export const contentTextImageTextSchema = defineEmailBlockSchema<ContentTextImageTextSchemaModel>({
  root: contentRoot,
  nodes: [
    {
      type: 'row',
      if: gp(groups.text, 'show'),
      styleBindings: {
        margin: gp(groups.text, 'margin'),
      },
      children: [
        {
          type: 'text',
          group: groups.text.id,
          value: gp(groups.text, 'value'),
          attrs: gp(groups.text, 'attrs'),
        },
      ],
    },
    {
      type: 'row',
      if: gp(groups.image, 'show'),
      styleBindings: {
        margin: gp(groups.image, 'margin'),
      },
      children: [
        {
          type: 'logo',
          group: groups.image.id,
          attrs: gp(groups.image, 'attrs'),
          link: gp(groups.image, 'link'),
          align: gp(groups.image, 'align'),
          width: gp(groups.image, 'width'),
        },
      ],
    },
    {
      type: 'row',
      if: gp(groups.textSecondary, 'show'),
      styleBindings: {
        margin: gp(groups.textSecondary, 'margin'),
      },
      children: [
        {
          type: 'text',
          group: groups.textSecondary.id,
          value: gp(groups.textSecondary, 'value'),
          attrs: gp(groups.textSecondary, 'attrs'),
        },
      ],
    },
  ],
})

export const contentWithGridSchema = defineEmailBlockSchema<ContentWithGridSchemaModel>({
  root: contentRoot,
  nodes: [
    {
      type: 'row',
      if: gp(groups.textGrid, 'show'),
      styleBindings: {
        margin: gp(groups.textGrid, 'margin'),
      },
      children: [
        {
          type: 'grid',
          group: groups.textGrid.id,
          items: gp(groups.textGrid, 'items'),
          align: gp(groups.textGrid, 'align'),
          gap: gp(groups.textGrid, 'gap'),
          width: gp(groups.textGrid, 'width'),
        },
      ],
    },
    {
      type: 'row',
      if: gp(groups.imageGrid, 'show'),
      styleBindings: {
        margin: gp(groups.imageGrid, 'margin'),
      },
      children: [
        {
          type: 'grid',
          group: groups.imageGrid.id,
          items: gp(groups.imageGrid, 'items'),
          align: gp(groups.imageGrid, 'align'),
          gap: gp(groups.imageGrid, 'gap'),
          width: gp(groups.imageGrid, 'width'),
        },
      ],
    },
  ],
})

export const contentRowsGridSchema = defineEmailBlockSchema<ContentRowsGridSchemaModel>({
  root: contentRoot,
  nodes: [
    {
      type: 'row',
      if: gp(groups.rowOneGrid, 'show'),
      styleBindings: {
        margin: gp(groups.rowOneGrid, 'margin'),
      },
      children: [
        {
          type: 'grid',
          group: groups.rowOneGrid.id,
          items: gp(groups.rowOneGrid, 'items'),
          align: gp(groups.rowOneGrid, 'align'),
          gap: gp(groups.rowOneGrid, 'gap'),
          width: gp(groups.rowOneGrid, 'width'),
        },
      ],
    },
    {
      type: 'row',
      if: gp(groups.rowTwoGrid, 'show'),
      styleBindings: {
        margin: gp(groups.rowTwoGrid, 'margin'),
      },
      children: [
        {
          type: 'grid',
          group: groups.rowTwoGrid.id,
          items: gp(groups.rowTwoGrid, 'items'),
          align: gp(groups.rowTwoGrid, 'align'),
          gap: gp(groups.rowTwoGrid, 'gap'),
          width: gp(groups.rowTwoGrid, 'width'),
        },
      ],
    },
  ],
})

export const contentTextRowsGridSchema = defineEmailBlockSchema<ContentTextRowsGridSchemaModel>({
  root: contentRoot,
  nodes: [
    {
      type: 'row',
      if: gp(groups.text, 'show'),
      styleBindings: {
        margin: gp(groups.text, 'margin'),
      },
      children: [
        {
          type: 'text',
          group: groups.text.id,
          value: gp(groups.text, 'value'),
          attrs: gp(groups.text, 'attrs'),
        },
      ],
    },
    {
      type: 'row',
      if: gp(groups.rowOneGrid, 'show'),
      styleBindings: {
        margin: gp(groups.rowOneGrid, 'margin'),
      },
      children: [
        {
          type: 'grid',
          group: groups.rowOneGrid.id,
          items: gp(groups.rowOneGrid, 'items'),
          align: gp(groups.rowOneGrid, 'align'),
          gap: gp(groups.rowOneGrid, 'gap'),
          width: gp(groups.rowOneGrid, 'width'),
        },
      ],
    },
    {
      type: 'row',
      if: gp(groups.rowTwoGrid, 'show'),
      styleBindings: {
        margin: gp(groups.rowTwoGrid, 'margin'),
      },
      children: [
        {
          type: 'grid',
          group: groups.rowTwoGrid.id,
          items: gp(groups.rowTwoGrid, 'items'),
          align: gp(groups.rowTwoGrid, 'align'),
          gap: gp(groups.rowTwoGrid, 'gap'),
          width: gp(groups.rowTwoGrid, 'width'),
        },
      ],
    },
  ],
})

export const contentThreeRowsGridSchema = defineEmailBlockSchema<ContentThreeRowsGridSchemaModel>({
  root: contentRoot,
  nodes: [
    {
      type: 'row',
      if: gp(groups.rowOneGrid, 'show'),
      styleBindings: {
        margin: gp(groups.rowOneGrid, 'margin'),
      },
      children: [
        {
          type: 'grid',
          group: groups.rowOneGrid.id,
          items: gp(groups.rowOneGrid, 'items'),
          align: gp(groups.rowOneGrid, 'align'),
          gap: gp(groups.rowOneGrid, 'gap'),
          width: gp(groups.rowOneGrid, 'width'),
        },
      ],
    },
    {
      type: 'row',
      if: gp(groups.rowTwoGrid, 'show'),
      styleBindings: {
        margin: gp(groups.rowTwoGrid, 'margin'),
      },
      children: [
        {
          type: 'grid',
          group: groups.rowTwoGrid.id,
          items: gp(groups.rowTwoGrid, 'items'),
          align: gp(groups.rowTwoGrid, 'align'),
          gap: gp(groups.rowTwoGrid, 'gap'),
          width: gp(groups.rowTwoGrid, 'width'),
        },
      ],
    },
    {
      type: 'row',
      if: gp(groups.rowThreeGrid, 'show'),
      styleBindings: {
        margin: gp(groups.rowThreeGrid, 'margin'),
      },
      children: [
        {
          type: 'grid',
          group: groups.rowThreeGrid.id,
          items: gp(groups.rowThreeGrid, 'items'),
          align: gp(groups.rowThreeGrid, 'align'),
          gap: gp(groups.rowThreeGrid, 'gap'),
          width: gp(groups.rowThreeGrid, 'width'),
        },
      ],
    },
  ],
})
