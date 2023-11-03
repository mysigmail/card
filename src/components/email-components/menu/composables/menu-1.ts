import { getMenuItems } from './utils'
import { useCommon } from './common'
import type { Tool } from '@/types/editor'

export function useMenu1(tools: Tool[]) {
  const common = useCommon(tools)
  const items = getMenuItems(tools, 'text')

  return {
    ...common,
    items,
  }
}
