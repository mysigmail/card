<template>
  <div class="editor">
    <EditorComponentList />
    <EditorCanvas />
    <EditorToolsPanel />
  </div>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.editor {
  display: grid;
  grid-template-columns: var(--editor-component-list-width) 1fr var(
      --editor-tools-width
    );
}
</style>
