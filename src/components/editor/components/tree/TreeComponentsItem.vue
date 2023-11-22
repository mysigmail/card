<template>
  <div
    class="tree-components-item"
    :class="{
      'is-active': id === editableId,
    }"
  >
    <div class="body">
      <div
        class="header"
        @click="onEditTool('General', index)"
      >
        {{ name }}
        <div class="actions">
          <div
            class="actions__item"
            @click.stop="onClick('copy')"
          >
            <UniconsCopy />
          </div>
          <div
            class="actions__item"
            @click.stop="onClick('remove')"
          >
            <UniconsTrashAlt />
          </div>
        </div>
      </div>
      <div class="tools">
        <div
          v-for="(_, k, idx) in tools"
          :key="idx"
          class="tools__item"
          :class="{
            'is-active': k === editableToolsGroupName && id === editableId,
          }"
          @click="onEditTool(k, index)"
        >
          {{ k }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useComponentsStore } from '@/store/components'
import type { Tool } from '@/types/editor'

interface Props {
  id: string
  name: string
  index: number
  tools: Record<string, Tool[]>
}

const props = defineProps<Props>()

const { onEditTool, editableToolsGroupName, editableId, removeComponent, duplicateComponent }
  = useComponentsStore()

function onClick(type: 'copy' | 'remove') {
  if (type === 'remove')
    removeComponent(props.index)

  if (type === 'copy')
    duplicateComponent(props.index)
}
</script>

<style lang="scss" scoped>
.tree-components-item {
  padding-top: 6px;
  user-select: none;
  &.is-active {
    position: relative;
    &::before {
      position: absolute;
      content: '';
      height: 100%;
      width: 2px;
      background-color: var(--color-primary);
    }
  }
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-xs) var(--spacing-sm);
    cursor: pointer;
    .actions {
      &__item {
        padding: 2px;
        cursor: pointer;
        svg {
          fill: var(--color-grey-600);
        }
        &:hover {
          svg {
            fill: var(--color-grey-900);
          }
        }
      }
      display: flex;
    }
  }
  + .tree-components-item {
    margin-top: 0;
  }
  .tools {
    &__item {
      padding: 4px var(--spacing-md);
      cursor: pointer;
      color: var(--color-grey-600);
      font-size: var(--text-sm);
      &:first-child {
        padding-top: 0;
      }
      &:hover {
        color: var(--color-grey-700);
      }
      &.is-active {
        color: var(--color-grey-900);
      }
    }
  }
}
</style>
