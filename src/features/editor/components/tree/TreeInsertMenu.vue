<script setup lang="ts">
import type { TreeInsertType } from '@/features/editor/components/tree/use-tree-helpers'
import { computed } from 'vue'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { getTreeInsertTypeMeta } from './use-tree-helpers'

interface Props {
  allowedTypes: TreeInsertType[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'select', type: TreeInsertType): void
  (e: 'openChange', open: boolean): void
}>()

const menuItems = computed(() => {
  return props.allowedTypes.map(type => ({
    type,
    ...getTreeInsertTypeMeta(type),
  }))
})

function onSelect(type: TreeInsertType) {
  emit('select', type)
}
</script>

<template>
  <DropdownMenu @update:open="(val) => emit('openChange', val)">
    <DropdownMenuTrigger as-child>
      <slot />
    </DropdownMenuTrigger>
    <DropdownMenuContent align="center">
      <DropdownMenuItem
        v-for="item in menuItems"
        :key="item.type"
        @select="onSelect(item.type)"
      >
        <component
          :is="item.icon"
          class="mr-2 size-4"
        />
        <span>{{ item.label }}</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
