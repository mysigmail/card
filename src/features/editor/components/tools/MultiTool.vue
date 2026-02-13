<script setup lang="ts">
import type { MultiTool } from '@/features/editor/model'
import { Plus } from 'lucide-vue-next'
import { ref } from 'vue'
import { useComponentsStore } from '@/features/editor/model'
import { Button } from '@/shared/ui/button'

interface Props {
  id: string
  value: MultiTool['value']
  title: string
}

const props = defineProps<Props>()

const { addNewToolToMultiTool, deleteMultiToolItem } = useComponentsStore()

const localValue = ref(props.value)

function onAddNew() {
  addNewToolToMultiTool(props.id)
}

function onAction(action: string, index: number) {
  if (action === 'delete')
    deleteMultiToolItem(props.id, index)
}
</script>

<template>
  <div data-slot="multi-tool">
    <EditorToolLabel>
      {{ title }}
    </EditorToolLabel>
    <div class="body">
      <div
        v-for="(group, index) in value"
        :key="index"
        class="multi-tool-group"
      >
        <EditorPanel type="bordered">
          <EditorPanelItem
            :index="index"
            :title="group.tools[0].value as string"
            :show-actions="index !== 0 && localValue.length > 1"
            @action="onAction($event, index)"
          >
            <EditorComponentTools
              :tools="group.tools"
              :parent-multi-tool-id="group.id"
            />
          </EditorPanelItem>
        </EditorPanel>
      </div>
      <Button
        variant="ghost"
        @click="onAddNew"
      >
        <Plus class="size-4" />
        Add Item
      </Button>
    </div>
  </div>
</template>
