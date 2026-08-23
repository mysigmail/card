<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { TextAtom } from '@/entities/block'
import { MColumn, MRow } from '@mysigmail/vue-email-components'
import {
  isTextBoxEnabled,
  resolveTextBoxCellStyle,
  resolveTextBoxRootStyle,
  resolveTextBoxTableStyle,
} from '@/features/email-preview/lib/text-box'

interface Props {
  atom: TextAtom
  horizontalAlign?: 'left' | 'center' | 'right'
  preview?: boolean
}

defineOptions({ inheritAttrs: false })
defineProps<Props>()
const emit = defineEmits<{
  click: [event: MouseEvent]
  keydown: [event: KeyboardEvent]
}>()

function cellStyle(atom: TextAtom, preview = false) {
  const style = {
    ...resolveTextBoxCellStyle(atom),
  } as CSSProperties & Record<string, string>
  if (preview)
    style['--p-text-paragraph-spacing'] = `${Math.max(0, atom.paragraphSpacing || 0)}px`
  return style
}
</script>

<template>
  <div
    v-bind="$attrs"
    data-slot="email-text-box"
    :style="resolveTextBoxRootStyle(atom)"
    @click="emit('click', $event)"
    @keydown="emit('keydown', $event)"
  >
    <MRow
      v-if="isTextBoxEnabled(atom)"
      :data-selection-owner="preview ? '' : undefined"
      :style="resolveTextBoxTableStyle(atom, horizontalAlign)"
    >
      <MColumn
        :class="{ 'p-text-box-content': preview }"
        :style="cellStyle(atom, preview)"
      >
        <slot />
      </MColumn>
    </MRow>
    <slot v-else />
  </div>
</template>
