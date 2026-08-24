<script setup lang="ts">
import type { InspectorControl } from './use-settings-tools'
import { Switch } from '@/shared/ui/switch'

interface Props {
  layoutTools: InspectorControl[]
  appearanceTools: InspectorControl[]
  hiddenOnMobile: boolean
  collapseOnMobile: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:hiddenOnMobile', value: boolean): void
  (e: 'update:collapseOnMobile', value: boolean): void
}>()
</script>

<template>
  <EditorPanel data-slot="row-settings">
    <EditorInspectorHeader title="Row" />
    <EditorPanelItem
      title="Layout"
      state-key="row:layout"
      default-open
    >
      <div class="space-y-3 pb-2">
        <InspectorLayoutTools :tools="layoutTools" />
      </div>
    </EditorPanelItem>
    <EditorPanelItem
      title="Appearance"
      state-key="row:appearance"
    >
      <div class="space-y-3 pb-2">
        <InspectorAppearanceTools :tools="appearanceTools" />
      </div>
    </EditorPanelItem>
    <EditorPanelItem
      title="Mobile"
      state-key="row:mobile"
      :summary="hiddenOnMobile ? 'Hidden' : collapseOnMobile ? 'Visible · Stacks' : 'Visible'"
    >
      <div class="flex gap-6 pb-2">
        <div>
          <EditorToolLabel> Hide on Mobile </EditorToolLabel>
          <Switch
            :model-value="hiddenOnMobile"
            @update:model-value="(value) => emit('update:hiddenOnMobile', value)"
          />
        </div>
        <div>
          <EditorToolLabel> Stack Columns </EditorToolLabel>
          <Switch
            :model-value="collapseOnMobile"
            @update:model-value="(value) => emit('update:collapseOnMobile', value)"
          />
        </div>
      </div>
    </EditorPanelItem>
  </EditorPanel>
</template>
