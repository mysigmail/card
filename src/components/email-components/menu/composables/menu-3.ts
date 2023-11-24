import { computed } from 'vue'
import { useCommon } from './common'
import type { ColorPickerTool, PaddingTool, Tool } from '@/types/editor'
import { getValueFromToolsByGroupByName } from '@/store/components/utils'

export function useMenu3(tools: Tool[]) {
  const common = useCommon(tools)

  const isShowSocial = computed(() => {
    return getValueFromToolsByGroupByName(common.toolsByGroup.value, 'Social', 'Show / Hide')
  })

  return {
    ...common,
    isShowSocial,
  }
}
