<script setup lang="ts">
import type { Tool } from '@/features/editor/model'
import { Switch } from '@/shared/ui/switch'

interface Props {
  spacingTools: Tool[]
  appearanceTools: Tool[]
}

defineProps<Props>()

const rowHiddenOnMobile = defineModel<boolean>('hiddenOnMobile', { required: true })
const rowCollapseOnMobile = defineModel<boolean>('collapseOnMobile', { required: true })
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
              <Switch v-model="rowHiddenOnMobile" />
            </div>
            <div>
              <EditorToolLabel type="secondary">
                Collapse on Mobile
              </EditorToolLabel>
              <Switch v-model="rowCollapseOnMobile" />
            </div>
          </div>
        </div>

        <EditorComponentTools :tools="appearanceTools" />
      </div>
    </EditorPanelItem>
  </EditorPanel>
</template>
