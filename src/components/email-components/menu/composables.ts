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
import { getToolsByGroup, getValueFromToolsByType } from '@/store/components/utils'

export function useMenu(tools: Tool[]) {
  const toolsByGroup = computed(() => getToolsByGroup(tools))

  const generalPadding = computed(() => {
    return getValueFromToolsByType<PaddingTool>(toolsByGroup.value.General, 'padding')
  })

  const generalBg = computed(() => {
    return getValueFromToolsByType<ColorPickerTool>(toolsByGroup.value.General, 'colorPicker')
  })

  const logoContainerWidth = computed(() => {
    return getValueFromToolsByType<InputNumberTool>(toolsByGroup.value.Logo, 'inputNumber')
  })

  const logoImage = computed(() => {
    return getValueFromToolsByType<ImageTool>(toolsByGroup.value.Logo, 'image')
  })

  const layoutAttrs = computed(() => {
    const padding = generalPadding.value.map(i => `${i}px`).join(' ')

    return {
      style: {
        padding,
        backgroundColor: generalBg.value,
      },
    } as HTMLElement
  })

  const logoAttrs = computed(() => {
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
    return getValueFromToolsByType<ToggleTool>(toolsByGroup.value.Menu, 'toggle')
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
