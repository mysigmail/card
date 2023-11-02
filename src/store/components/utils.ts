import { nanoid } from 'nanoid'
import type { Component, MultiTool, Tool } from '@/types/editor'
import { clone } from '@/utils'

export function cloneComponent(component: Component) {
  const cloned = clone(component)
  cloned.id = nanoid(8)

  return cloned
}

export function findToolById(id: string, tools: Tool[]): Tool | undefined {
  for (const tool of tools) {
    if (tool.id === id)
      return tool

    if (tool.type === 'multi') {
      for (const multiTool of (tool as MultiTool).value) {
        const desired = findToolById(id, multiTool.tools)
        if (desired)
          return desired
      }
    }
  }
}
