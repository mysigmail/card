<script setup lang="ts">
import { EditorContent } from '@tiptap/vue-3'
import { useEditor } from '@/components/editor/components/tools/text/composables'

interface Props {
  id: string
  value: string
  title: string
}

const props = defineProps<Props>()

const { editor, init } = useEditor({ provide: true })

init(props.id, props.value)
</script>

<template>
  <div>
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
