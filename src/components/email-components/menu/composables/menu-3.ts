import { computed } from 'vue'
import { useCommon } from './common'
import type { AlignTool, ImageTool, InputTool, MultiTool, Tool } from '@/types/editor'
import {
  getToolsByGroup,
  getValueFromToolsByGroupByName,
  getValueFromToolsByName,
} from '@/store/components/utils'
import type { Social } from '@/types/email-components/components'

export function useMenu3(tools: Tool[]) {
  const common = useCommon(tools)

  const toolsByGroup = computed(() => getToolsByGroup(tools))

  const isShowSocial = computed(() => {
    return getValueFromToolsByGroupByName(common.toolsByGroup.value, 'Social', 'Show / Hide')
  })

  const socialAlign = computed(() => {
    return getValueFromToolsByGroupByName<AlignTool>(toolsByGroup.value, 'Social', 'Align')
  })

  const socialItems = computed(() => {
    const items = getValueFromToolsByGroupByName<MultiTool>(toolsByGroup.value, 'Social', 'List')

    return items?.map((i) => {
      return {
        image: getValueFromToolsByName<ImageTool>(i.tools, 'Image'),
        link: getValueFromToolsByName<InputTool>(i.tools, 'Link'),
      }
    }) as Social[]
  })

  return {
    ...common,
    isShowSocial,
    socialAlign,
    socialItems,
  }
}
