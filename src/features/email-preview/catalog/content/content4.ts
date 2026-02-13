import type { BlockNode } from '@/entities/block'
import type { BlockPreset, ComponentTheme } from '@/features/editor'
import { nanoid } from 'nanoid'
import { createBlockNode } from '@/entities/block'
import {
  buildTextAtom,
  createCell,
  resetRow,
} from '@/features/email-preview/catalog/composer-helpers'
import { images } from '@/features/email-preview/catalog/images'

function buildContent4Block(label: string): BlockNode {
  const block = createBlockNode(label)
  block.settings.spacing = {
    padding: [30, 35, 30, 35],
  }
  block.settings.backgroundColor = '#FFFFFF'
  block.settings.backgroundImage = undefined

  const row = block.rows[0]
  resetRow(row)
  row.cells = [
    createCell({
      horizontalAlign: 'left',
      verticalAlign: 'top',
      atoms: [
        buildTextAtom({
          value:
            '<p style="text-align: center"><span style="color: rgb(159, 163, 167); font-size: 14px">12 July \'19</span></p><p style="text-align: center"><strong><span style="font-size: 24px">How to Stick to Your Fitness Habits the Easy</span></strong><br><strong><span style="font-size: 24px">Way, According to Science</span></strong></p><p style="text-align: center"><span style="color: rgb(159, 163, 167); font-size: 14px">Staying in shape is mostly about program compliance: it&rsquo;s not about having</span><br><span style="color: rgb(159, 163, 167); font-size: 14px">the best fitness program, but about having one that&rsquo;s good enough, and</span><br><span style="color: rgb(159, 163, 167); font-size: 14px">making sure you actually stick to it.</span></p>',
          color: '#111111',
        }),
      ],
    }),
  ]

  block.rows = [row]

  return block
}

export function content4Preset(_: ComponentTheme, label: string): BlockPreset {
  return {
    id: nanoid(8),
    version: 2,
    name: 'content4',
    label,
    type: 'content',
    preview: images.components.content4,
    block: buildContent4Block(label),
  }
}
