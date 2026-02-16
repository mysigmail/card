<script setup lang="ts">
import type { Atom } from '@/entities/block'
import type { Tool } from '@/features/editor/model'
import { Switch } from '@/shared/ui/switch'

interface Props {
  atom: Atom
  spacingTools: Tool[]
  tools: Tool[]
}

defineProps<Props>()

const atomHiddenOnMobile = defineModel<boolean>('hiddenOnMobile', { required: true })
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
            <Switch v-model="atomHiddenOnMobile" />
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
