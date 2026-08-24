<script setup lang="ts">
import type { AtomRef } from '@/features/editor/model'
import { Editor, EditorContent } from '@tiptap/vue-3'
import { nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import { sanitizeButtonEditorHtml, sanitizeTextEditorHtml } from '@/entities/template'
import { useCanvas, useHistory } from '@/features/editor/model'
import { useInlineTextEditing } from './composables/use-inline-text-editing'
import {
  canPersistInlineTextOnUnmount,
  replaceEditorContent,
  textSelectionPositionAtCoords,
  textSelectionPositionAtOffset,
} from './inline-text-session'
import {
  createInlineButtonExtensions,
  createInlineTextExtensions,
  normalizeInlineEditorHtml,
} from './text-editor-core'

interface Props {
  atomRef: AtomRef<'text'> | AtomRef<'button'>
  value: string
}

const props = defineProps<Props>()
const editor = shallowRef<Editor>()
const root = ref<HTMLElement>()
const { getNodePropertyState, updateNodeProperty } = useCanvas()
const { flushPendingSnapshot } = useHistory()
const {
  consumeEditingPointerPosition,
  registerEditor,
  requestToolbarUpdate,
  stopEditing,
  unregisterEditor,
} = useInlineTextEditing()
let initialSelectionRafId: number | undefined
let finished = false
const profile = props.atomRef.atomType
const sanitizeEditorHtml = profile === 'button' ? sanitizeButtonEditorHtml : sanitizeTextEditorHtml
let lastModelValue = sanitizeEditorHtml(props.value)

function getAtomValue() {
  const state
    = props.atomRef.atomType === 'button'
      ? getNodePropertyState(props.atomRef, 'value')
      : getNodePropertyState(props.atomRef, 'value')
  return state.kind === 'value' ? state.value : undefined
}

function updateAtomValue(html: string) {
  return props.atomRef.atomType === 'button'
    ? updateNodeProperty({ ref: props.atomRef, property: 'value', value: html })
    : updateNodeProperty({ ref: props.atomRef, property: 'value', value: html })
}

function persistEditorValue() {
  if (!editor.value)
    return

  const value = sanitizeEditorHtml(editor.value.getHTML())
  updateAtomValue(value)
  lastModelValue = value
}

function finishEditing() {
  if (finished)
    return

  persistEditorValue()
  flushPendingSnapshot()
  finished = true
  stopEditing(props.atomRef.atomId)
}

function onRootKeydown(event: KeyboardEvent) {
  if (
    event.defaultPrevented
    || event.isComposing
    || (event.key !== 'Escape' && (profile !== 'button' || event.key !== 'Enter'))
  ) {
    return
  }

  event.preventDefault()
  finishEditing()
}

function focusInitialSelection() {
  const currentEditor = editor.value
  if (!currentEditor)
    return

  const pointerPosition = consumeEditingPointerPosition(props.atomRef.atomId)
  const position
    = pointerPosition?.textOffset !== undefined
      ? textSelectionPositionAtOffset(currentEditor, pointerPosition.textOffset)
      : pointerPosition
        ? textSelectionPositionAtCoords(currentEditor, pointerPosition)
        : undefined

  if (position !== undefined) {
    currentEditor.chain().setTextSelection(position).focus().run()
    return
  }

  currentEditor.commands.focus('end')
}

onMounted(() => {
  editor.value = new Editor({
    content:
      profile === 'button'
        ? sanitizeEditorHtml(props.value)
        : normalizeInlineEditorHtml(sanitizeEditorHtml(props.value)),
    extensions:
      profile === 'button' ? createInlineButtonExtensions() : createInlineTextExtensions(),
    editorProps: {
      attributes: {
        'class': [
          'p-inline-text-editor__content',
          profile === 'button' ? 'p-inline-text-editor__content--button' : '',
        ]
          .filter(Boolean)
          .join(' '),
        'aria-label': profile === 'button' ? 'Inline button text editor' : 'Inline text editor',
      },
      handleKeyDown: (_view, event) => {
        if (
          event.isComposing
          || (event.key !== 'Escape' && (profile !== 'button' || event.key !== 'Enter'))
        ) {
          return false
        }

        event.preventDefault()
        finishEditing()
        return true
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      requestToolbarUpdate()
      updateAtomValue(sanitizeEditorHtml(currentEditor.getHTML()))
    },
    onSelectionUpdate: () => {
      requestToolbarUpdate()
    },
  })

  registerEditor(props.atomRef.atomId, editor.value, profile)

  nextTick(() => {
    initialSelectionRafId = window.requestAnimationFrame(() => {
      initialSelectionRafId = undefined
      focusInitialSelection()
    })
  })
})

watch(
  () => props.value,
  (value) => {
    const nextValue = sanitizeEditorHtml(value)
    const currentValue = editor.value ? sanitizeEditorHtml(editor.value.getHTML()) : ''
    lastModelValue = nextValue

    if (editor.value && currentValue !== nextValue)
      replaceEditorContent(editor.value, nextValue)
  },
)

onBeforeUnmount(() => {
  if (initialSelectionRafId !== undefined)
    window.cancelAnimationFrame(initialSelectionRafId)

  if (
    canPersistInlineTextOnUnmount({
      currentModelValue: getAtomValue(),
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
    data-inline-atom-editor
    :data-inline-editor-profile="profile"
    data-selection-content
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
