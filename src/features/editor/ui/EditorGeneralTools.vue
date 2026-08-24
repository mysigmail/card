<script setup lang="ts">
import GeneralBackgroundSettings from '@/features/editor/components/tools/GeneralBackgroundSettings.vue'
import GeneralPreviewTextSettings from '@/features/editor/components/tools/GeneralPreviewTextSettings.vue'
import GeneralSpacingSettings from '@/features/editor/components/tools/GeneralSpacingSettings.vue'
</script>

<template>
  <EditorPanel data-slot="editor-general-tools">
    <EditorInspectorHeader title="Main" />
    <GeneralPreviewTextSettings />
    <GeneralSpacingSettings />
    <GeneralBackgroundSettings />
  </EditorPanel>
</template>
