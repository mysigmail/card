<script setup lang="ts">
import GeneralBackgroundSettings from '@/features/editor/components/tools/GeneralBackgroundSettings.vue'
import GeneralFontSettings from '@/features/editor/components/tools/GeneralFontSettings.vue'
import GeneralPreviewTextSettings from '@/features/editor/components/tools/GeneralPreviewTextSettings.vue'
import GeneralSpacingSettings from '@/features/editor/components/tools/GeneralSpacingSettings.vue'
</script>

<template>
  <EditorPanel data-slot="editor-general-tools">
    <GeneralSpacingSettings />
    <GeneralBackgroundSettings />
    <GeneralFontSettings />
    <GeneralPreviewTextSettings />
  </EditorPanel>
</template>

<style scoped></style>
