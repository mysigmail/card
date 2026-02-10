import type { ComponentBuilder } from '@/types/editor'
import { nanoid } from 'nanoid'
import { images } from '@/components/email-components/catalog/images'
import { f } from '@/components/email-components/fields'
import { contentWithImageBlockSchema, groups } from './schema'

export const content1: ComponentBuilder = (_, label) => {
  return {
    id: nanoid(8),
    name: 'Content1',
    label,
    schema: contentWithImageBlockSchema,
    type: 'content',
    preview: images.components.content1,
    tools: [
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
          '<p style="text-align: center"><span style="color: rgb(159, 163, 167); font-size: 14px">12 July \'19</span></p><p style="text-align: center"><strong><span style="font-size: 24px">Is There a Perfect Time of</span></strong><br><strong><span style="font-size: 24px">Day to Meditate?</span></strong></p>',
      }),
      f.showHide({
        group: groups.text,
      }),
      f.spacing({
        group: groups.imageBlock,
        value: {
          margin: [0, 0, 0, 0],
        },
      }),
      f.backgroundImage({
        group: groups.imageBlock,
        value: {
          url: '/img/simon-migaj-Yui5vfKHuzs-unsplash.jpg',
          position: 'center',
          repeat: 'no-repeat',
          size: 'cover',
        },
      }),
      f.inputNumber({
        group: groups.imageBlock,
        key: 'height',
        label: 'Height',
        value: 200,
      }),
      f.inputNumber({
        group: groups.imageBlock,
        key: 'borderRadius',
        label: 'Border Radius',
        value: 5,
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
    ],
  }
}
