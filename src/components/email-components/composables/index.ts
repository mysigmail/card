import { computed } from 'vue'
import { useLayout } from './layout'
import { useLogo } from './logo'
import { useText } from './text'
import { useMenu } from './menu'
import type { Tool } from '@/types/editor'
import { getToolsByGroup } from '@/store/components/utils'

export function useCommon(tools: Tool[]) {
  const toolsByGroup = computed(() => getToolsByGroup(tools))

  const layoutTools = useLayout(toolsByGroup)
  const logoTools = useLogo(toolsByGroup)
  const menuTools = useMenu(toolsByGroup)
  const textTools = useText(toolsByGroup)

  return {
    ...layoutTools,
    ...logoTools,
    ...menuTools,
    ...textTools,
  }
}
