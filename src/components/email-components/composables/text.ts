import type { ComputedRef } from 'vue'
import { computed } from 'vue'
import { getValueFromToolsByGroupByName, normalizePath } from '@/store/components/utils'
import type {
  BackgroundImageTool,
  ColorPickerTool,
  SpacingTool,
  TextEditorTool,
  ToggleTool,
  Tool,
} from '@/types/editor'

export function useText(toolsByGroup: ComputedRef<Record<string, Tool[]>>) {
  const text = computed(() => {
    return getValueFromToolsByGroupByName<TextEditorTool>(toolsByGroup.value, 'Text', 'Content')
  })

  const textColor = computed(() => {
    return getValueFromToolsByGroupByName<ColorPickerTool>(toolsByGroup.value, 'Text', 'Main Color')
  })

  const textPadding = computed(() => {
    const padding = getValueFromToolsByGroupByName<SpacingTool>(
      toolsByGroup.value,
      'Text',
      'Spacings',
    )?.padding

    return padding?.map(i => `${i}px`).join(' ')
  })

  const textMargin = computed(() => {
    const margin = getValueFromToolsByGroupByName<SpacingTool>(
      toolsByGroup.value,
      'Text',
      'Spacings',
    )?.margin

    return margin?.map(i => `${i}px`).join(' ')
  })

  const textBackgroundImage = computed(() => {
    return getValueFromToolsByGroupByName<BackgroundImageTool>(
      toolsByGroup.value,
      'Text',
      'Background Image',
    )
  })

  const textAttrs = computed(() => {
    const imgPath = normalizePath(textBackgroundImage.value?.url)

    return {
      style: {
        color: textColor.value,
        padding: textPadding.value,
        backgroundImage: `url(${imgPath})`,
        backgroundSize: textBackgroundImage.value?.size,
        backgroundRepeat: textBackgroundImage.value?.repeat,
        backgroundPosition: textBackgroundImage.value?.position,
      },
    } as HTMLElement
  })

  const isShowText = computed(() => {
    return getValueFromToolsByGroupByName<ToggleTool>(toolsByGroup.value, 'Text', 'Show / Hide')
  })

  return {
    isShowText,
    text,
    textAttrs,
    textBackgroundImage,
    textColor,
    textMargin,
    textPadding,
  }
}
