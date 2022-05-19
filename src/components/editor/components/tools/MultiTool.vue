<template>
  <div class="multi-tool">
    <EditorToolLabel>
      {{ title }}
    </EditorToolLabel>
    <div class="body">
      <div
        v-for="(group, index) in localValue"
        :key="index"
        class="multi-tool-group"
      >
        <EditorPanel type="bordered">
          <EditorPanelItem
            :index="index"
            :title="group.label"
            :show-actions="index !== 0 && localValue.length > 1"
            @action="onAction($event, index)"
          >
            <EditorTools
              :tools="(group.value as Tool[])"
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

<script setup lang="ts">
import { useComponentsStore } from '@/store/components'
import type { Tool } from '@/types/editor'
import { ref } from 'vue'

interface Props {
  id: string
  value: Tool[]
  title: string
}

const props = defineProps<Props>()

const componentsStore = useComponentsStore()

const localValue = ref(props.value)

const onAddNew = () => {
  componentsStore.addNewToolToMultiTool(props.id)
}

const onAction = (action: string, index: number) => {
  if (action === 'delete') {
    componentsStore.deleteMultiToolItem(props.id, index)
  }
}
</script>

<style lang="scss" scoped></style>
