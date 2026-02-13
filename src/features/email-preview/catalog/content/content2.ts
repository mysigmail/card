import type { BlockNode } from '@/entities/block'
import type { BlockPreset, ComponentTheme } from '@/features/editor'
import { nanoid } from 'nanoid'
import { createBlockNode, createRowNode } from '@/entities/block'
import {
  buildTextAtom,
  createCell,
  createImageBackgroundCell,
  resetRow,
} from '@/features/email-preview/catalog/composer-helpers'
import { images } from '@/features/email-preview/catalog/images'

function buildContent2Block(label: string): BlockNode {
  const block = createBlockNode(label)
  block.settings.spacing = {
    padding: [30, 35, 30, 35],
  }
  block.settings.backgroundColor = '#FFFFFF'
  block.settings.backgroundImage = undefined

  const textRow = block.rows[0]
  resetRow(textRow)
  textRow.settings.gap = 20
  textRow.settings.spacing = {
    padding: [0, 0, 12, 0],
  }
  textRow.cells = [
    createCell({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [
        buildTextAtom({
          value:
            '<p style="text-align: left"><span style="color: rgb(159, 163, 167); font-size: 14px">12 July \'19</span></p><p style="text-align: left"><strong><span style="font-size: 24px">How Music Affects</span></strong><br><strong><span style="font-size: 24px">Your Productivity</span></strong></p>',
          color: '#111111',
        }),
      ],
    }),
    createCell({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [
        buildTextAtom({
          value:
            '<p style="text-align: left"><span style="color: rgb(159, 163, 167); font-size: 14px">12 July \'19</span></p><p style="text-align: left"><strong><span style="font-size: 24px">Background Music for</span></strong><br><strong><span style="font-size: 24px">Coding</span></strong></p>',
          color: '#111111',
        }),
      ],
    }),
  ]

  const imageRow = createRowNode([])
  resetRow(imageRow)
  imageRow.settings.gap = 20
  imageRow.cells = [
    createImageBackgroundCell('/img/juja-han-HU-uL54pfQI-unsplash.jpg', {
      height: 200,
      borderRadius: 5,
      link: 'https://example.com',
    }),
    createImageBackgroundCell('/img/jefferson-santos-9SoCnyQmkzI-unsplash.jpg', {
      height: 200,
      borderRadius: 5,
      link: 'https://example.com',
    }),
  ]

  block.rows = [textRow, imageRow]

  return block
}

export function content2Preset(_: ComponentTheme, label: string): BlockPreset {
  return {
    id: nanoid(8),
    version: 2,
    name: 'content2',
    label,
    type: 'content',
    preview: images.components.content2,
    block: buildContent2Block(label),
  }
}
