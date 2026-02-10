import type { ComponentBuilder } from '@/types/editor'
import { nanoid } from 'nanoid'
import { images } from '@/components/email-components/catalog/images'
import { f } from '@/components/email-components/fields'
import { contentTextRowsGridSchema, groups } from './schema'

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

export const content6: ComponentBuilder = (_, label) => {
  return {
    id: nanoid(8),
    name: 'Content6',
    label,
    schema: contentTextRowsGridSchema,
    type: 'content',
    preview: images.components.content6,
    tools: [
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
  }
}
