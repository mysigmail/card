<template>
  <EditorPanel>
    <EditorPanelItem title="Background" type="opened">
      <ColorPickerTool
        id="bgColor"
        v-model="general.background.color"
        title="Color"
        :auto-update="false"
      />
    </EditorPanelItem>
  </EditorPanel>
</template>

<script setup lang="ts">
import { useComponentsStore } from '@/store/components'

const { general } = useComponentsStore()
</script>

<style lang="scss" scoped></style>
