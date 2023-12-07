import { computed } from 'vue'
import { useCommon } from './common'
import type { ColorPickerTool, PaddingTool, Tool } from '@/types/editor'
import { getValueFromToolsByGroupByName } from '@/store/components/utils'

export function useMenu2(tools: Tool[]) {
  const common = useCommon(tools)

  const dividerColor = computed(() => {
    return getValueFromToolsByGroupByName<ColorPickerTool>(
      common.toolsByGroup.value,
      'Divider',
      'Color',
    )
  })

  const dividerPadding = computed(() => {
    const _padding = getValueFromToolsByGroupByName<PaddingTool>(
      common.toolsByGroup.value,
      'Divider',
      'Padding',
    )
    const padding = _padding?.map(i => `${i}px`).join(' ')

    return {
      padding,
    } as CSSStyleDeclaration
  })

  const isShowDivider = computed(() => {
    return getValueFromToolsByGroupByName(common.toolsByGroup.value, 'Divider', 'Show / Hide')
  })

  return {
    ...common,
    dividerColor,
    dividerPadding,
    isShowDivider,
  }
}
