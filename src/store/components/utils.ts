import type { Component, GridTool, MultiTool, Tool, ToolGroupRole } from '@/types/editor'
import { nanoid } from 'nanoid'
import { resolveToolGroup } from '@/components/email-components/schema/groups'
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

    if (tool.type === 'multi' || tool.type === 'grid') {
      for (const multiTool of (tool as MultiTool | GridTool).value) {
        const desired = findToolById(id, multiTool.tools)
        if (desired)
          return desired
      }
    }
  }
}

export function getToolsByGroup(tools: Tool[]) {
  const groupsWithTools: Record<string, Tool[]> = {}

  getToolGroups(tools).forEach((group) => {
    groupsWithTools[group.id] = group.tools
  })

  return groupsWithTools
}

export function getEditableToolsByGroup(tools: Tool[]): Record<string, Tool[]> {
  return getToolsByGroup(tools)
}

export interface ToolGroupBucket {
  id: string
  label: string
  role: ToolGroupRole
  tools: Tool[]
}

export function getToolGroups(tools: Tool[]): ToolGroupBucket[] {
  const groups = new Map<string, ToolGroupBucket>()

  tools.forEach((tool) => {
    const group = resolveToolGroup(tool)

    if (!group)
      return

    const bucket = groups.get(group.id)

    if (!bucket) {
      groups.set(group.id, {
        id: group.id,
        label: group.label,
        role: group.role,
        tools: [tool],
      })
      return
    }

    bucket.tools.push(tool)
  })

  return [...groups.values()]
}

export function normalizePath(path?: string) {
  if (!path)
    return

  const basePath = import.meta.env.VITE_APP_BASE_PATH as string

  if (path?.startsWith('http') || path?.startsWith('https'))
    return path

  if (basePath && basePath !== '/' && path?.startsWith(basePath))
    return path

  if (path?.startsWith('/'))
    return basePath + path.slice(1)

  return path
}
