<script setup lang="ts">
import { Editor, EditorContent } from '@tiptap/vue-3'
import { nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { sanitizeTextEditorHtml } from '@/entities/template'
import { useCanvas, useHistory } from '@/features/editor/model'
import { useInlineTextEditing } from './composables/use-inline-text-editing'
import { canPersistInlineTextOnUnmount, replaceEditorContent } from './inline-text-session'
import { createInlineTextExtensions, normalizeInlineEditorHtml } from './text-editor-core'

interface Props {
  atomId: string
  value: string
}

const props = defineProps<Props>()
const editor = shallowRef<Editor>()
const root = ref<HTMLElement>()
const { getTextAtomValue, updateTextAtomValue } = useCanvas()
const { flushPendingSnapshot } = useHistory()
const { registerEditor, requestToolbarUpdate, stopEditing, unregisterEditor }
  = useInlineTextEditing()
let finished = false
let lastModelValue = sanitizeTextEditorHtml(props.value)

function persistEditorValue() {
  if (!editor.value)
    return

  const value = sanitizeTextEditorHtml(editor.value.getHTML())
  updateTextAtomValue(props.atomId, value)
  lastModelValue = value
}

function finishEditing() {
  if (finished)
    return

  persistEditorValue()
  flushPendingSnapshot()
  finished = true
  stopEditing(props.atomId)
}

function onRootKeydown(event: KeyboardEvent) {
  if (event.key !== 'Escape' || event.defaultPrevented)
    return

  event.preventDefault()
  finishEditing()
}

onMounted(() => {
  editor.value = new Editor({
    content: normalizeInlineEditorHtml(sanitizeTextEditorHtml(props.value)),
    extensions: createInlineTextExtensions(),
    autofocus: 'end',
    editorProps: {
      attributes: {
        'class': 'p-inline-text-editor__content',
        'aria-label': 'Inline text editor',
      },
      handleKeyDown: (_view, event) => {
        if (event.key !== 'Escape')
          return false

        event.preventDefault()
        finishEditing()
        return true
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      requestToolbarUpdate()
      updateTextAtomValue(props.atomId, currentEditor.getHTML())
    },
    onSelectionUpdate: () => {
      requestToolbarUpdate()
    },
  })

  registerEditor(props.atomId, editor.value)

  nextTick(() => editor.value?.commands.focus('end'))
})

watch(
  () => props.value,
  (value) => {
    const nextValue = sanitizeTextEditorHtml(value)
    const currentValue = editor.value ? sanitizeTextEditorHtml(editor.value.getHTML()) : ''
    lastModelValue = nextValue

    if (editor.value && currentValue !== nextValue)
      replaceEditorContent(editor.value, nextValue)
  },
)

onBeforeUnmount(() => {
  if (
    canPersistInlineTextOnUnmount({
      currentModelValue: getTextAtomValue(props.atomId),
      finished,
      lastModelValue,
    })
  ) {
    persistEditorValue()
  }
  flushPendingSnapshot()
  if (editor.value)
    unregisterEditor(editor.value)
  editor.value?.destroy()
  editor.value = undefined
})
</script>

<template>
  <div
    ref="root"
    data-slot="inline-text-editor"
    data-inline-text-editor
    class="p-inline-text-editor"
    @click.stop
    @dblclick.stop
    @keydown="onRootKeydown"
  >
    <EditorContent
      v-if="editor"
      class="p-inline-text-editor__host"
      :editor="editor"
    />
  </div>
</template>
