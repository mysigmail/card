import { computed } from 'vue'
import { useCommon } from './common'
import type { ColorPickerTool, Tool } from '@/types/editor'
import { getValueFromToolsByGroupByName } from '@/store/components/utils'

export function useMenu2(tools: Tool[]) {
  const common = useCommon(tools)

  const generalDividerColor = computed(() => {
    return getValueFromToolsByGroupByName<ColorPickerTool>(
      common.toolsByGroup.value,
      'Divider',
      'Color',
    )
  })

  const isShowDivider = computed(() => {
    return getValueFromToolsByGroupByName(common.toolsByGroup.value, 'Divider', 'Show / Hide')
  })

  const dividerAttrs = computed(() => {
    return {
      style: {
        borderColor: generalDividerColor.value,
        margin: '20px 0',
      },
    } as HTMLElement
  })

  return {
    ...common,
    dividerAttrs,
    isShowDivider,
  }
}
