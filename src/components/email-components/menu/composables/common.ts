import { computed } from 'vue'
import type {
  ColorPickerTool,
  ImageTool,
  InputNumberTool,
  InputTool,
  MultiTool,
  PaddingTool,
  ToggleTool,
  Tool,
} from '@/types/editor'
import {
  getToolsByGroup,
  getValueFromToolsByGroupByName,
  getValueFromToolsByName,
} from '@/store/components/utils'
import type { MenuItemImg, MenuItemText } from '@/types/email-components/menu'

export function useCommon(tools: Tool[]) {
  const toolsByGroup = computed(() => getToolsByGroup(tools))

  const layoutPadding = computed(() => {
    return getValueFromToolsByGroupByName<PaddingTool>(toolsByGroup.value, 'Layout', 'Padding')
  })

  const layoutBackground = computed(() => {
    return getValueFromToolsByGroupByName<ColorPickerTool>(
      toolsByGroup.value,
      'Layout',
      'Background Color',
    )
  })

  const logoImage = computed(() => {
    return getValueFromToolsByGroupByName<ImageTool>(toolsByGroup.value, 'Logo', 'Image')
  })

  const layoutAttrs = computed(() => {
    const padding = layoutPadding.value?.map(i => `${i}px`).join(' ')

    return {
      style: {
        padding,
        backgroundColor: layoutBackground.value,
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

  const isShowMenu = computed(() => {
    return getValueFromToolsByGroupByName<ToggleTool>(toolsByGroup.value, 'Menu', 'Show / Hide')
  })

  const isShowLogo = computed(() => {
    return getValueFromToolsByGroupByName<ToggleTool>(toolsByGroup.value, 'Logo', 'Show / Hide')
  })

  const itemsText = computed(() => {
    const items = getValueFromToolsByGroupByName<MultiTool>(toolsByGroup.value, 'Menu', 'List')

    return items?.map((i) => {
      return {
        text: getValueFromToolsByName<InputTool>(i.tools, 'Name'),
        link: getValueFromToolsByName<InputTool>(i.tools, 'Link'),
        color: getValueFromToolsByName<ColorPickerTool>(i.tools, 'Color'),
        fontSize: getValueFromToolsByName<InputNumberTool>(i.tools, 'Font Size'),
      }
    }) as MenuItemText[]
  })

  const itemsImg = computed(() => {
    const items = getValueFromToolsByGroupByName<MultiTool>(toolsByGroup.value, 'Social', 'List')

    return items?.map((i) => {
      return {
        image: getValueFromToolsByName<ImageTool>(i.tools, 'Image'),
        link: getValueFromToolsByName<InputTool>(i.tools, 'Link'),
      }
    }) as MenuItemImg[]
  })

  return {
    layoutBackground,
    isShowLogo,
    isShowMenu,
    itemsImg,
    itemsText,
    layoutAttrs,
    logoAttrs,
    logoImage,
    toolsByGroup,
  }
}
