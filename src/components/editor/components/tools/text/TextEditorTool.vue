<template>
  <div class="text-editor-tool">
    <EditorToolLabel>
      {{ title }}
    </EditorToolLabel>
    <div class="body">
      <div class="actions">
        <TextEditorActions />
      </div>
      <EditorContent
        class="content"
        :editor="editor"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { EditorContent } from '@tiptap/vue-3'
import { useEditor } from './composables'

interface Props {
  id: string
  value: string
  title: string
}

const props = defineProps<Props>()

const { editor, init } = useEditor()

init(props.id, props.value)
</script>

<style lang="scss" scoped>
.text-editor-tool {
  .body {
    padding: var(--spacing-xs);
    border: 1px solid var(--color-border);
    border-radius: 6px;
  }
}

:deep(.tiptap) {
  outline: none;
}
</style>
