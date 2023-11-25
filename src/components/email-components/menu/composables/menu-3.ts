import { computed } from 'vue'
import { useCommon } from './common'
import type { AlignTool, ColorPickerTool, PaddingTool, Tool } from '@/types/editor'
import { getToolsByGroup, getValueFromToolsByGroupByName } from '@/store/components/utils'

export function useMenu3(tools: Tool[]) {
  const common = useCommon(tools)

  const toolsByGroup = computed(() => getToolsByGroup(tools))

  const isShowSocial = computed(() => {
    return getValueFromToolsByGroupByName(common.toolsByGroup.value, 'Social', 'Show / Hide')
  })

  const socialAlign = computed(() => {
    return getValueFromToolsByGroupByName<AlignTool>(toolsByGroup.value, 'Social', 'Align')
  })

  return {
    ...common,
    socialAlign,
    isShowSocial,
  }
}
