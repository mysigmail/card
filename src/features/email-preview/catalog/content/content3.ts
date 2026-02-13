import type { BlockNode, TextAtom } from '@/entities/block'
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

function createArticleTextAtom(
  titleLine1: string,
  titleLine2: string,
  description: string,
): TextAtom {
  return buildTextAtom({
    value: `<p style="text-align: left"><span style="color: rgb(159, 163, 167); font-size: 14px">12 July '19</span></p><p style="text-align: left"><strong><span style="font-size: 24px">${titleLine1}</span></strong><br><strong><span style="font-size: 24px">${titleLine2}</span></strong></p><p style="text-align: left"><span style="color: rgb(159, 163, 167); font-size: 14px">${description}</span></p>`,
    color: '#111111',
  })
}

function buildContent3Block(label: string): BlockNode {
  const block = createBlockNode(label)
  block.settings.spacing = {
    padding: [30, 35, 30, 35],
  }
  block.settings.backgroundColor = '#FFFFFF'
  block.settings.backgroundImage = undefined

  const rowOneRow = block.rows[0]
  resetRow(rowOneRow)
  rowOneRow.settings.gap = 20
  rowOneRow.settings.spacing = {
    padding: [0, 0, 20, 0],
  }
  rowOneRow.cells = [
    createImageBackgroundCell('/img/juja-han-HU-uL54pfQI-unsplash.jpg', {
      height: 200,
      borderRadius: 5,
      link: 'https://example.com',
    }),
    createCell({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [
        createArticleTextAtom(
          'How Music Affects',
          'Your Productivity',
          'Music is regarded as one of the triumphs of human creativity.',
        ),
      ],
    }),
  ]

  const rowTwoRow = createRowNode([])
  resetRow(rowTwoRow)
  rowTwoRow.settings.gap = 20
  rowTwoRow.cells = [
    createImageBackgroundCell('/img/jefferson-santos-9SoCnyQmkzI-unsplash.jpg', {
      height: 200,
      borderRadius: 5,
      link: 'https://example.com',
    }),
    createCell({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [
        createArticleTextAtom(
          'Background Music for',
          'Coding',
          'Do you guys use background music while coding?',
        ),
      ],
    }),
  ]

  block.rows = [rowOneRow, rowTwoRow]

  return block
}

export function content3Preset(_: ComponentTheme, label: string): BlockPreset {
  return {
    id: nanoid(8),
    version: 2,
    name: 'content3',
    label,
    type: 'content',
    preview: images.components.content3,
    block: buildContent3Block(label),
  }
}
