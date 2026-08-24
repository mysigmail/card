import type { Editor } from '@tiptap/vue-3'
import type { InlineEditorProfile } from '../text-editor-core'
import type { EditorSelectionSnapshot } from '@/features/editor/model'
import { ref, shallowRef, watch } from 'vue'
import { useSelection } from '@/features/editor/model'

export interface InlineTextPointerPosition {
  left: number
  top: number
  textOffset?: number
}

const editingAtomId = ref<string>()
const activeEditor = shallowRef<Editor>()
const activeEditorProfile = ref<InlineEditorProfile>()
const editorRevision = ref(0)
let editingSelection: EditorSelectionSnapshot | undefined
let editingPointerPosition: (InlineTextPointerPosition & { atomId: string }) | undefined
let initialized = false

export function useInlineTextEditing() {
  const { applySelectionSnapshot, captureSelectionSnapshot, selectedAtomId } = useSelection()

  if (!initialized) {
    initialized = true
    watch(selectedAtomId, (atomId) => {
      if (editingAtomId.value && atomId !== editingAtomId.value && editingSelection) {
        applySelectionSnapshot(editingSelection)
      }
    })
  }

  function startEditing(atomId: string, pointerPosition?: InlineTextPointerPosition) {
    if (selectedAtomId.value === atomId) {
      editingSelection = captureSelectionSnapshot()
      editingPointerPosition = pointerPosition ? { atomId, ...pointerPosition } : undefined
      editingAtomId.value = atomId
    }
  }

  function consumeEditingPointerPosition(atomId: string) {
    if (editingPointerPosition?.atomId !== atomId)
      return undefined

    const { left, textOffset, top } = editingPointerPosition
    editingPointerPosition = undefined
    return { left, textOffset, top }
  }

  function stopEditing(atomId?: string) {
    if (!atomId || editingAtomId.value === atomId) {
      editingAtomId.value = undefined
      activeEditor.value = undefined
      activeEditorProfile.value = undefined
      editingSelection = undefined
      editingPointerPosition = undefined
    }
  }

  function registerEditor(atomId: string, editor: Editor, profile: InlineEditorProfile) {
    if (editingAtomId.value !== atomId)
      return

    activeEditor.value = editor
    activeEditorProfile.value = profile
    editorRevision.value += 1
  }

  function unregisterEditor(editor: Editor) {
    if (activeEditor.value !== editor)
      return

    activeEditor.value = undefined
    activeEditorProfile.value = undefined
  }

  function requestToolbarUpdate() {
    editorRevision.value += 1
  }

  return {
    activeEditor,
    activeEditorProfile,
    consumeEditingPointerPosition,
    editingAtomId,
    editorRevision,
    registerEditor,
    requestToolbarUpdate,
    startEditing,
    stopEditing,
    unregisterEditor,
  }
}
