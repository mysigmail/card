<script setup lang="ts">
import type { InspectorControl } from './use-settings-tools'
import type { Atom } from '@/entities/block'
import { Switch } from '@/shared/ui/switch'

interface Props {
  atom: Atom
  spacingTools: InspectorControl[]
  tools: InspectorControl[]
  hiddenOnMobile: boolean
}

defineProps<Props>()

const emit = defineEmits<{ (e: 'update:hiddenOnMobile', value: boolean): void }>()
</script>

<template>
  <EditorPanel data-slot="atom-settings">
    <EditorPanelItem
      type="opened"
      :title="atom.type.charAt(0).toUpperCase() + atom.type.slice(1)"
    >
      <div class="space-y-3 pb-2">
        <EditorComponentTools
          v-if="spacingTools.length"
          :tools="spacingTools"
        />

        <div class="space-y-3">
          <EditorToolLabel>View</EditorToolLabel>
          <div>
            <EditorToolLabel type="secondary">
              Hide on Mobile
            </EditorToolLabel>
            <Switch
              :model-value="hiddenOnMobile"
              @update:model-value="(value) => emit('update:hiddenOnMobile', value)"
            />
          </div>
        </div>

        <EditorComponentTools
          v-if="tools.length"
          :tools="tools"
        />
      </div>
    </EditorPanelItem>
  </EditorPanel>
</template>
