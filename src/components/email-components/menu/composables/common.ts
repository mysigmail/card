import { computed } from 'vue'
import { getMenuItems } from './utils'
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

  const logoImage = computed(() => {
    return getValueFromToolsByGroupByName<ImageTool>(toolsByGroup.value, 'Logo', 'Image')
  })

  const logoContainerWidth = computed(() => {
    return getValueFromToolsByGroupByName<InputNumberTool>(
      toolsByGroup.value,
      'Logo',
      'Container Width',
    )
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
    const items = getValueFromToolsByGroupByName<MultiTool>(toolsByGroup.value, 'Menu', 'List')

    return items?.map((i) => {
      return {
        image: getValueFromToolsByName<ImageTool>(i.tools, 'Image'),
        link: getValueFromToolsByName<InputTool>(i.tools, 'Link'),
      }
    }) as MenuItemImg[]
  })

  return {
    generalBg,
    isShowLogo,
    isShowMenu,
    itemsImg,
    itemsText,
    layoutAttrs,
    logoAttrs,
    logoContainerWidth,
    logoImage,
    toolsByGroup,
  }
}
