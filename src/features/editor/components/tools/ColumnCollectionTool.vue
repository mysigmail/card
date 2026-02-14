<script setup lang="ts">
import type { ColumnCollectionTool } from '@/features/editor/model'
import { Plus } from 'lucide-vue-next'
import { ref } from 'vue'
import { useCanvas } from '@/features/editor/model'
import { Button } from '@/shared/ui/button'

interface Props {
  id: string
  value: ColumnCollectionTool['value']
  title: string
}

const props = defineProps<Props>()

const { addNewToolToMultiTool, deleteMultiToolItem } = useCanvas()

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
  <div data-slot="column-collection-tool">
    <EditorToolLabel>
      {{ title }}
    </EditorToolLabel>
    <div class="body">
      <div
        v-for="(group, index) in value"
        :key="index"
      >
        <EditorPanel type="bordered">
          <EditorPanelItem
            :index="index"
            :title="`Column ${index + 1}`"
            :show-actions="localValue.length > 1"
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
        Add Column
      </Button>
    </div>
  </div>
</template>
