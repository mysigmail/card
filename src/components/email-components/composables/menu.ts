import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import { getValueFromToolsByGroupByName, getValueFromToolsByName } from '@/store/components/utils'
import type {
  AlignTool,
  ColorPickerTool,
  InputNumberTool,
  InputTool,
  MultiTool,
  PaddingTool,
  SpacingTool,
  ToggleTool,
  Tool,
} from '@/types/editor'
import type { Menu } from '@/types/email-components/components'

export function useMenu(toolsByGroup: ComputedRef<Record<string, Tool[]>>) {
  const menuAlign = computed(() => {
    return getValueFromToolsByGroupByName<AlignTool>(toolsByGroup.value, 'Menu', 'Align')
  })

  const menuPadding = computed(() => {
    const padding = getValueFromToolsByGroupByName<SpacingTool>(
      toolsByGroup.value,
      'Menu',
      'Spacings',
    )?.padding

    return padding?.map(i => `${i}px`).join(' ')
  })

  const isShowMenu = computed(() => {
    return getValueFromToolsByGroupByName<ToggleTool>(toolsByGroup.value, 'Menu', 'Show / Hide')
  })

  const menuItems = computed(() => {
    const items = getValueFromToolsByGroupByName<MultiTool>(toolsByGroup.value, 'Menu', 'List')

    return items?.map((i) => {
      return {
        text: getValueFromToolsByName<InputTool>(i.tools, 'Name'),
        link: getValueFromToolsByName<InputTool>(i.tools, 'Link'),
        color: getValueFromToolsByName<ColorPickerTool>(i.tools, 'Color'),
        fontSize: getValueFromToolsByName<InputNumberTool>(i.tools, 'Font Size'),
      }
    }) as Menu[]
  })

  return {
    isShowMenu,
    menuAlign,
    menuPadding,
    menuItems,
  }
}
