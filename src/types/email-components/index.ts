import type { MultiTool, SingleTool, ToolType } from '@/types/editor'

export interface ToolBuilderConfig<T extends SingleTool | MultiTool> {
  key: string
  group?: string
  label: string
  name?: string
  type: ToolType
  value: T['value']
}
