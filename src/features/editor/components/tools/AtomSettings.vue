<script setup lang="ts">
import type { InspectorControl } from './use-settings-tools'
import type { Atom } from '@/entities/block'
import { Switch } from '@/shared/ui/switch'

interface Props {
  atom: Atom
  contentTools: InspectorControl[]
  layoutTools: InspectorControl[]
  appearanceTools: InspectorControl[]
  hiddenOnMobile: boolean
}

defineProps<Props>()

const emit = defineEmits<{ (e: 'update:hiddenOnMobile', value: boolean): void }>()
</script>

<template>
  <EditorPanel data-slot="atom-settings">
    <EditorInspectorHeader :title="atom.type.charAt(0).toUpperCase() + atom.type.slice(1)" />
    <EditorPanelItem
      v-if="contentTools.length"
      :key="`${atom.type}-content`"
      title="Content"
      :state-key="`${atom.type}:content`"
      default-open
    >
      <div class="space-y-3 pb-2">
        <EditorComponentTools :tools="contentTools" />
      </div>
    </EditorPanelItem>

    <EditorPanelItem
      v-if="layoutTools.length"
      :key="`${atom.type}-layout`"
      title="Layout"
      :state-key="`${atom.type}:layout`"
      :default-open="!contentTools.length"
    >
      <div class="space-y-3 pb-2">
        <InspectorLayoutTools :tools="layoutTools" />
      </div>
    </EditorPanelItem>
    <EditorPanelItem
      v-if="appearanceTools.length"
      :key="`${atom.type}-appearance`"
      title="Appearance"
      :state-key="`${atom.type}:appearance`"
    >
      <div class="space-y-3 pb-2">
        <InspectorAppearanceTools :tools="appearanceTools" />
      </div>
    </EditorPanelItem>
    <EditorPanelItem
      :key="`${atom.type}-mobile`"
      title="Mobile"
      :state-key="`${atom.type}:mobile`"
      :summary="hiddenOnMobile ? 'Hidden' : 'Visible'"
    >
      <div class="pb-2">
        <EditorToolLabel> Hide on Mobile </EditorToolLabel>
        <Switch
          :model-value="hiddenOnMobile"
          @update:model-value="(value) => emit('update:hiddenOnMobile', value)"
        />
      </div>
    </EditorPanelItem>
  </EditorPanel>
</template>
