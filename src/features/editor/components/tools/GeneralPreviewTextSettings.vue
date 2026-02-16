<script setup lang="ts">
import { useCanvas } from '@/features/editor/model'
import { Textarea } from '@/shared/ui/textarea'

const { general } = useCanvas()
</script>

<template>
  <EditorPanelItem
    data-slot="general-preview-text-settings"
    title="Preview Text"
    type="opened"
  >
    <Textarea
      v-model="general.previewText"
      placeholder="Email preview text (preheader) is a small line of text that appears after the subject line in an email inbox."
    />
  </EditorPanelItem>
</template>
