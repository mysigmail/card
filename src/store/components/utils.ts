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

export function getValueFromToolsByName<T extends { value: unknown }>(tools: Tool[], name: string) {
  const value = tools.find(i => i.label === name)?.value

  if (!value)
    return console.warn(`Could not find tool with name "${name}"`)

  return value as T['value'] | undefined
}

export function getValueFromToolsByGroupByName<T extends { value: unknown }>(
  toolsByGroup: Record<string, Tool[]>,
  group: string,
  name: string,
) {
  return toolsByGroup[group] ? getValueFromToolsByName<T>(toolsByGroup[group], name) : undefined
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
