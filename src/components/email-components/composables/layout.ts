import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import { getValueFromToolsByGroupByName } from '@/store/components/utils'
import type { BackgroundImageTool, ColorPickerTool, SpacingTool, Tool } from '@/types/editor'

export function useLayout(toolsByGroup: ComputedRef<Record<string, Tool[]>>) {
  const layoutPadding = computed(() => {
    const padding = getValueFromToolsByGroupByName<SpacingTool>(
      toolsByGroup.value,
      'Layout',
      'Spacings',
    )?.padding

    return padding?.map(i => `${i}px`).join(' ')
  })

  const layoutBackground = computed(() => {
    return getValueFromToolsByGroupByName<ColorPickerTool>(
      toolsByGroup.value,
      'Layout',
      'Background Color',
    )
  })

  const layoutBackgroundImage = computed(() => {
    return getValueFromToolsByGroupByName<BackgroundImageTool>(
      toolsByGroup.value,
      'Layout',
      'Background Image',
    )
  })

  const layoutAttrs = computed(() => {
    return {
      style: {
        padding: layoutPadding.value,
        backgroundColor: layoutBackground.value,
        backgroundImage: `url(${layoutBackgroundImage.value?.url})`,
        backgroundSize: layoutBackgroundImage.value?.size,
        backgroundPosition: layoutBackgroundImage.value?.position,
      },
    } as HTMLElement
  })

  return {
    layoutAttrs,
    layoutBackground,
    layoutBackgroundImage,
    layoutPadding,
  }
}
