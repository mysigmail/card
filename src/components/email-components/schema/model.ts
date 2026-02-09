import type { CSSProperties } from 'vue'
import type { SchemaGroupModel } from '@/components/email-components/schema/adapters'
import type { Tool } from '@/types/editor'
import { resolveSchemaGroupAdapter } from '@/components/email-components/schema/adapters'
import { getToolGroups } from '@/store/components/utils'

export type SchemaModel = Record<string, SchemaGroupModel>

export function buildSchemaModel(tools: Tool[]): SchemaModel {
  const groups = getToolGroups(tools)
  const model: SchemaModel = {}

  for (const group of groups) {
    model[group.id] = resolveSchemaGroupAdapter(group.role)({
      groupId: group.id,
      groupRole: group.role,
      tools: group.tools,
    })
  }

  return model
}

export function resolveSchemaPath(model: SchemaModel, path?: string) {
  if (!path)
    return undefined

  return path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object')
      return (acc as Record<string, unknown>)[key]

    return undefined
  }, model)
}

export function resolveSchemaStyle(model: SchemaModel, styleBindings?: Record<string, string>) {
  if (!styleBindings)
    return undefined

  const style: Record<string, string | number> = {}

  for (const [property, path] of Object.entries(styleBindings)) {
    const value = resolveSchemaPath(model, path)

    if (value === undefined || value === null || value === '')
      continue

    style[property] = value as string | number
  }

  return style as CSSProperties
}
