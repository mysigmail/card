import type { BlockNode } from '@/entities/block'
import type { ComponentType } from '@/entities/template'

interface BlockJsonPayload {
  version: 2
  name: string
  label: string
  type: ComponentType
  preview: string
  block: BlockNode
}

export function saveBlockAsJson(
  block: BlockNode,
  options: {
    name?: string
    type?: ComponentType
  } = {},
) {
  const name = options.name || block.label.toLowerCase().replace(/\s+/g, '-')
  const type = options.type || 'content'

  const payload: BlockJsonPayload = {
    version: 2,
    name,
    label: block.label,
    type,
    preview: '',
    block,
  }

  const json = JSON.stringify(payload, null, 2)
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `${name}.json`
  a.click()

  URL.revokeObjectURL(url)
}
