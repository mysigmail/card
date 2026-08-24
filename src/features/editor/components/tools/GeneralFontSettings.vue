<script setup lang="ts">
import { computed } from 'vue'
import {
  createGoogleFontStack,
  getCategoryFallback,
  getGoogleFontFallback,
  GOOGLE_FONT_FALLBACK_AUTO,
  GOOGLE_FONT_FALLBACK_OPTIONS,
  resolveGoogleFontFromStack,
} from '@/entities/font'
import { useCanvas } from '@/features/editor/model'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import FontFamilyPicker from './FontFamilyPicker.vue'

const { general } = useCanvas()

const selectedGoogleFont = computed(() => resolveGoogleFontFromStack(general.font))
const selectedFallback = computed({
  get() {
    const font = selectedGoogleFont.value
    const fallback = getGoogleFontFallback(general.font)
    if (!font || !fallback || fallback === getCategoryFallback(font.category))
      return GOOGLE_FONT_FALLBACK_AUTO

    return GOOGLE_FONT_FALLBACK_OPTIONS.some(option => option.value === fallback)
      ? fallback
      : GOOGLE_FONT_FALLBACK_AUTO
  },
  set(fallback: string) {
    const font = selectedGoogleFont.value
    if (!font)
      return

    general.font = createGoogleFontStack(
      font,
      fallback === GOOGLE_FONT_FALLBACK_AUTO ? undefined : fallback,
    )
  },
})
</script>

<template>
  <div data-slot="general-font-settings">
    <EditorToolLabel>Font</EditorToolLabel>
    <FontFamilyPicker v-model="general.font" />
    <p class="text-muted-foreground mt-1.5 text-xs leading-snug">
      Email clients without web font support will use the fallback font.
    </p>
    <template v-if="selectedGoogleFont">
      <EditorToolLabel level="parameter">
        Fallback Font
      </EditorToolLabel>
      <Select v-model="selectedFallback">
        <SelectTrigger size="sm">
          <SelectValue placeholder="Select fallback font" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem
            v-for="option in GOOGLE_FONT_FALLBACK_OPTIONS"
            :key="option.value"
            :value="option.value"
          >
            {{ option.label }}
          </SelectItem>
        </SelectContent>
      </Select>
    </template>
  </div>
</template>
