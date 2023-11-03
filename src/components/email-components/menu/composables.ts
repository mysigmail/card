import { computed } from 'vue'
import { getMenuItems } from './utils'
import type {
  ColorPickerTool,
  ImageTool,
  InputNumberTool,
  PaddingTool,
  ToggleTool,
  Tool,
} from '@/types/editor'
import { getToolsByGroup, getValueFromToolsByGroupByName } from '@/store/components/utils'

export function useMenu(tools: Tool[]) {
  const toolsByGroup = computed(() => getToolsByGroup(tools))

  const generalPadding = computed(() => {
    return getValueFromToolsByGroupByName<PaddingTool>(toolsByGroup.value, 'General', 'Padding')
  })

  const generalBg = computed(() => {
    return getValueFromToolsByGroupByName<ColorPickerTool>(
      toolsByGroup.value,
      'General',
      'Background Color',
    )
  })

  const logoContainerWidth = computed(() => {
    return getValueFromToolsByGroupByName<InputNumberTool>(
      toolsByGroup.value,
      'Logo',
      'Container Width',
    )
  })

  const logoImage = computed(() => {
    return getValueFromToolsByGroupByName<ImageTool>(toolsByGroup.value, 'Logo', 'Image')
  })

  const layoutAttrs = computed(() => {
    const padding = generalPadding.value?.map(i => `${i}px`).join(' ')

    return {
      style: {
        padding,
        backgroundColor: generalBg.value,
      },
    } as HTMLElement
  })

  const logoAttrs = computed(() => {
    if (!logoImage.value)
      return

    const { src, width, height, alt } = logoImage.value

    return {
      src,
      alt,
      style: {
        width: `${width}px`,
        height: `${height}px`,
      },
    } as HTMLImageElement
  })

  const items = computed(() => getMenuItems(tools))

  const isShowMenu = computed(() => {
    return getValueFromToolsByGroupByName<ToggleTool>(toolsByGroup.value, 'Menu', 'Show / Hide')
  })

  return {
    generalPadding,
    generalBg,
    logoContainerWidth,
    layoutAttrs,
    logoAttrs,
    items,
    isShowMenu,
  }
}
