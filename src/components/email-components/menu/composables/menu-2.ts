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

  const dividerColorPadding = computed(() => {
    return getValueFromToolsByGroupByName<PaddingTool>(
      common.toolsByGroup.value,
      'Divider',
      'Padding',
    )
  })

  const isShowDivider = computed(() => {
    return getValueFromToolsByGroupByName(common.toolsByGroup.value, 'Divider', 'Show / Hide')
  })

  const dividerAttrs = computed(() => {
    return {
      style: {
        borderColor: dividerColor.value,
        margin: dividerColorPadding.value
          ?.map((i, index) => {
            return index % 2 === 0 ? `${i}px` : 0
          })
          .join(' '),
      },
    } as HTMLElement
  })

  return {
    ...common,
    dividerAttrs,
    isShowDivider,
  }
}
