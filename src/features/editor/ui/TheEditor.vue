<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useInlineTextEditing } from '@/features/editor/components/tools/text/composables/use-inline-text-editing'
import InlineTextToolbar from '@/features/editor/components/tools/text/InlineTextToolbar.vue'
import { useCanvas, usePersistence, useSelection } from '@/features/editor/model'
import Editor from '@/features/editor/ui/EditorCanvas.vue'
import { renderToShadowDom } from '@/shared/lib/shadow-dom'

const previewRef = ref()

const { general } = useCanvas()
const { resetSelection } = useSelection()
const { hydrateTemplateFromLocalStorage } = usePersistence()
const { activeEditor, editingAtomId, editorRevision, stopEditing } = useInlineTextEditing()

function isInlineEditingSurface(event: PointerEvent) {
  return event.composedPath().some((target) => {
    if (!(target instanceof HTMLElement))
      return false

    return Boolean(
      target.dataset.inlineTextEditor !== undefined
      || target.dataset.inlineTextToolbar !== undefined
      || target.closest('[data-inline-text-toolbar]')
      || target.closest('[data-reka-popper-content-wrapper]')
      || target.closest('[role="listbox"]'),
    )
  })
}

function finishInlineEditingOnOutsidePointer(event: PointerEvent) {
  if (editingAtomId.value && !isInlineEditingSurface(event))
    stopEditing(editingAtomId.value)
}

const previewHostStyle = computed(() => {
  return {
    backgroundColor: general.background.color,
    width: '100%',
    maxWidth: '100%',
    justifySelf: 'stretch',
  }
})

onMounted(() => {
  hydrateTemplateFromLocalStorage()

  const shadow = renderToShadowDom(previewRef.value!, Editor)

  shadow.addEventListener('click', (e) => {
    if (e.target instanceof HTMLBodyElement) {
      resetSelection()
    }
  })

  document.addEventListener('pointerdown', finishInlineEditingOnOutsidePointer)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', finishInlineEditingOnOutsidePointer)
})
</script>

<template>
  <div
    class="grid h-full min-h-0 [grid-template-columns:var(--editor-component-list-width)_1fr_var(--editor-tools-width)]"
  >
    <TheSidebar />
    <div
      ref="previewRef"
      :style="previewHostStyle"
    />
    <EditorTools />
    <InlineTextToolbar
      v-if="activeEditor && editingAtomId"
      :atom-id="editingAtomId"
      :editor="activeEditor"
      :revision="editorRevision"
    />
  </div>
</template>
