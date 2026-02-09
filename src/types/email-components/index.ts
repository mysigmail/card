import type { GridTool, MultiTool, SingleTool, ToolGroupRef, ToolType } from '@/types/editor'

export interface ToolBuilderConfig<T extends SingleTool | MultiTool | GridTool> {
  key: string
  group?: ToolGroupRef
  label: string
  name?: string
  type: ToolType
  value: T['value']
}
