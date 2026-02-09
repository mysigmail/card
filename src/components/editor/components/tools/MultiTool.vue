<script setup lang="ts">
import type { MultiTool } from '@/types/editor'
import { ref } from 'vue'
import { useComponentsStore } from '@/store/components'

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
  <div class="multi-tool">
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
      <ElButton
        style="width: 100%"
        type="primary"
        plain
        @click="onAddNew"
      >
        Add
      </ElButton>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
