import type { MultiTool, SingleTool, ToolType } from '../editor'

export interface ToolBuilderConfig<T extends SingleTool | MultiTool> {
  group?: string
  label: string
  name?: string
  type: ToolType
  value: T['value']
}
