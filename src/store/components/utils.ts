import { nanoid } from 'nanoid'
import type { Component, MultiTool, Tool, ToolType } from '@/types/editor'
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

export function getValueFromToolsByType<T extends { value: unknown }>(tools: Tool[], type: ToolType) {
  const value = tools.find(i => i.type === type)?.value

  return value as T['value']
}

export function getToolsByGroup(tools: Tool[]) {
  const groupsWithTools: Record<string, Tool[]> = {}

  tools.forEach((i) => {
    if (!i.group)
      return

    if (!groupsWithTools[i.group])
      groupsWithTools[i.group] = []

    if (groupsWithTools[i.group])
      groupsWithTools[i.group].push(i)
  })

  return groupsWithTools
}
