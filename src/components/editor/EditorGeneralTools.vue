<template>
  <EditorPanel>
    <EditorPanelItem title="Background" type="opened">
      <ColorPickerTool
        id="bgColor"
        v-model="generalStore.$state.background.color"
        title="Color"
        :auto-update="false"
      />
    </EditorPanelItem>
  </EditorPanel>
</template>

<script setup lang="ts">
import { useGeneralStore } from '@/store/general'

const generalStore = useGeneralStore()
</script>

<style lang="scss" scoped></style>
