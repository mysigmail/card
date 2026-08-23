<script setup lang="ts">
import type { InspectorControl } from './use-settings-tools'
import { Switch } from '@/shared/ui/switch'

interface Props {
  spacingTools: InspectorControl[]
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
    <EditorPanelItem
      type="opened"
      title="Row"
    >
      <div class="space-y-3 pb-2">
        <EditorComponentTools :tools="spacingTools" />

        <div class="space-y-3">
          <EditorToolLabel>View</EditorToolLabel>
          <div class="flex gap-6 -mt-2">
            <div>
              <EditorToolLabel type="secondary">
                Hide on Mobile
              </EditorToolLabel>
              <Switch
                :model-value="hiddenOnMobile"
                @update:model-value="(value) => emit('update:hiddenOnMobile', value)"
              />
            </div>
            <div>
              <EditorToolLabel type="secondary">
                Collapse on Mobile
              </EditorToolLabel>
              <Switch
                :model-value="collapseOnMobile"
                @update:model-value="(value) => emit('update:collapseOnMobile', value)"
              />
            </div>
          </div>
        </div>

        <EditorComponentTools :tools="appearanceTools" />
      </div>
    </EditorPanelItem>
  </EditorPanel>
</template>
