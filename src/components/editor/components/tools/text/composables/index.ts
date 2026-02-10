import Bold from '@tiptap/extension-bold'
import Color from '@tiptap/extension-color'
import Document from '@tiptap/extension-document'
import HardBreak from '@tiptap/extension-hard-break'
import Italic from '@tiptap/extension-italic'
import Link from '@tiptap/extension-link'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import { Editor } from '@tiptap/vue-3'
import { computed, inject, onBeforeUnmount, onMounted, provide, ref } from 'vue'
import { FontSize } from '@/components/editor/components/tools/text/extensions/font-size'
import { Strike } from '@/components/editor/components/tools/text/extensions/strike'
import { useComponentsStore } from '@/store/components'

const editorContextKey = Symbol('text-editor-context')

function createEditorContext() {
  const { updateToolById } = useComponentsStore()
  const editor = ref<Editor>()

  const link = computed({
    get() {
      return editor.value?.getAttributes('link')?.href ?? ''
    },
    set(v) {
      if (v)
        editor.value?.commands.setLink({ href: v })
      else editor.value?.commands.unsetLink()
    },
  })

  const textColor = computed({
    get() {
      return editor.value?.getAttributes('textStyle')?.color ?? ''
    },
    set(v) {
      editor.value?.chain().focus().setColor(v).run()
    },
  })

  const fontSize = computed({
    get() {
      const fontSize = editor.value?.getAttributes('textStyle')?.fontSize?.replace('px', '') ?? 16

      return fontSize
    },
    set(v) {
      if (v > 250)
        editor.value?.commands.setFontSize(250)
      else editor.value?.commands.setFontSize(v)
    },
  })

  function bold() {
    editor.value?.chain().focus().toggleBold().run()
  }

  function italic() {
    editor.value?.chain().focus().toggleItalic().run()
  }

  function underline() {
    editor.value?.chain().focus().toggleUnderline().run()
  }

  function strike() {
    if (editor.value?.isActive({ textDecoration: 'line-through' }))
      editor.value?.chain().focus().unsetCustomStrike().run()
    else editor.value?.chain().focus().setCustomStrike().run()
  }

  function align(align: 'left' | 'center' | 'right' | 'justify') {
    editor.value?.chain().focus().setTextAlign(align).run()
  }

  function init(toolId: string, content: string) {
    onMounted(() => {
      editor.value = new Editor({
        extensions: [
          Bold,
          Color.configure({
            types: ['textStyle'],
          }),
          Document,
          FontSize,
          HardBreak,
          Italic,
          Link,
          Paragraph,
          Strike,
          Text,
          TextAlign.configure({
            types: ['paragraph'],
          }),
          TextStyle,
          Underline,
        ],
        content,
      })

      editor.value.on('update', () => {
        updateToolById(toolId, 'value', editor.value?.getHTML() ?? '')
      })
    })

    onBeforeUnmount(() => {
      editor.value?.destroy()
      editor.value = undefined
    })
  }

  return {
    align,
    bold,
    editor,
    fontSize,
    init,
    italic,
    link,
    strike,
    textColor,
    underline,
  }
}

type EditorContext = ReturnType<typeof createEditorContext>

export function useEditor(config?: { provide?: boolean }) {
  if (config?.provide) {
    const context = createEditorContext()
    provide(editorContextKey, context)

    return context
  }

  const context = inject<EditorContext | null>(editorContextKey, null)
  if (!context)
    throw new Error('Text editor context is not provided')

  return context
}
