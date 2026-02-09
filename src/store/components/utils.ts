import type { Component, MultiTool, Tool } from '@/types/editor'
import { nanoid } from 'nanoid'
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

export function getEditableToolsByGroup(tools: Tool[]): Record<string, Tool[]> {
  return getToolsByGroup(tools)
}

export function normalizePath(path?: string) {
  if (!path)
    return

  const basePath = import.meta.env.VITE_APP_BASE_PATH as string

  if (path?.startsWith('/'))
    return basePath + path.slice(1)

  if (path?.startsWith('http') || path?.startsWith('https'))
    return path

  return path
}
