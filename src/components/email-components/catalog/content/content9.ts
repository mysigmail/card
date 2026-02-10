import type { ComponentBuilder } from '@/types/editor'
import { nanoid } from 'nanoid'
import { images } from '@/components/email-components/catalog/images'
import { f } from '@/components/email-components/fields'
import { contentThreeRowsGridSchema, groups } from './schema'

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

export const content9: ComponentBuilder = (_, label) => {
  return {
    id: nanoid(8),
    name: 'Content9',
    label,
    schema: contentThreeRowsGridSchema,
    type: 'content',
    preview: images.components.content9,
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
  }
}
