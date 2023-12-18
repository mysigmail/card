import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import { getValueFromToolsByGroupByName } from '@/store/components/utils'
import type {
  AlignTool,
  ImageTool,
  PaddingTool,
  SpacingTool,
  ToggleTool,
  Tool,
} from '@/types/editor'

export function useLogo(toolsByGroup: ComputedRef<Record<string, Tool[]>>) {
  const logoImage = computed(() => {
    return getValueFromToolsByGroupByName<ImageTool>(toolsByGroup.value, 'Logo', 'Image')
  })

  const logoAlign = computed(() => {
    return getValueFromToolsByGroupByName<AlignTool>(toolsByGroup.value, 'Logo', 'Align')
  })

  const logoPadding = computed(() => {
    const padding = getValueFromToolsByGroupByName<SpacingTool>(
      toolsByGroup.value,
      'Logo',
      'Spacings',
    )?.padding

    return padding?.map(i => `${i}px`).join(' ')
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

  const isShowLogo = computed(() => {
    return getValueFromToolsByGroupByName<ToggleTool>(toolsByGroup.value, 'Logo', 'Show / Hide')
  })

  return {
    isShowLogo,
    logoAlign,
    logoAttrs,
    logoImage,
    logoPadding,
  }
}
