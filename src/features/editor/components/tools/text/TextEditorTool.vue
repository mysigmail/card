<script setup lang="ts">
import { EditorContent } from '@tiptap/vue-3'
import { useEditor } from '@/features/editor/components/tools/text/composables'

interface Props {
  id: string
  value: string
  title: string
}

const props = defineProps<Props>()
const emit = defineEmits<{ (e: 'update:value', value: string): void }>()

const { editor, init } = useEditor({ provide: true })

init(props.value, value => emit('update:value', value))
</script>

<template>
  <div data-slot="text-editor-tool">
    <EditorToolLabel>
      {{ title }}
    </EditorToolLabel>
    <div class="rounded-md border border-border p-2">
      <div>
        <TextEditorActions />
      </div>
      <EditorContent
        class="[&_.tiptap]:outline-none"
        :editor="editor"
      />
    </div>
  </div>
</template>
