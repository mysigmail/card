import type { CSSProperties } from 'vue'
import { resolveSchemaGroupAdapter } from '@/components/email-components/schema/adapters'
import type { SchemaGroupModel } from '@/components/email-components/schema/adapters'
import { getToolsByGroup } from '@/store/components/utils'
import type { Tool } from '@/types/editor'

export type SchemaModel = Record<string, SchemaGroupModel>

export function buildSchemaModel(tools: Tool[]): SchemaModel {
  const groups = getToolsByGroup(tools)
  const model: SchemaModel = {}

  for (const [group, groupTools] of Object.entries(groups))
    model[group] = resolveSchemaGroupAdapter(group)({ group, tools: groupTools })

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
