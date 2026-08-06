import type { Editor } from '@tiptap/vue-3'
import { createDocument } from '@tiptap/vue-3'
import { normalizeInlineEditorHtml } from './text-editor-core'

interface InlineTextUnmountState {
  currentModelValue?: string
  finished: boolean
  lastModelValue: string
}

export function canPersistInlineTextOnUnmount(state: InlineTextUnmountState) {
  return !state.finished && state.currentModelValue === state.lastModelValue
}

export function replaceEditorContent(editor: Editor, value: string) {
  const document = createDocument(normalizeInlineEditorHtml(value), editor.schema)
  const transaction = editor.state.tr
    .replaceWith(0, editor.state.doc.content.size, document)
    .setMeta('preventUpdate', true)
    .setMeta('addToHistory', false)

  editor.view.dispatch(transaction)

  const historyPlugin = editor.state.plugins.find((plugin) => {
    const key = (plugin as unknown as { key?: unknown }).key
    return typeof key === 'string' && key.startsWith('history$')
  })
  if (historyPlugin) {
    editor.unregisterPlugin('history')
    editor.registerPlugin(historyPlugin)
  }
}
