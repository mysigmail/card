<script setup lang="ts">
import type { TreeInsertType } from '@/features/editor/components/tree/use-tree-helpers'
import { computed } from 'vue'
import TreeInsertMenu from '@/features/editor/components/tree/TreeInsertMenu.vue'

interface Props {
  visible?: boolean
  allowedTypes: TreeInsertType[]
  left?: number
}

const props = withDefaults(defineProps<Props>(), {
  left: 0,
  visible: false,
})

const emit = defineEmits<{
  (e: 'select', type: TreeInsertType): void
  (e: 'openChange', open: boolean): void
}>()

const defaultInsertType = computed(() => props.allowedTypes[0])

const buttonLabel = computed(() => {
  if (props.allowedTypes.includes('block'))
    return 'Add Block'

  if (props.allowedTypes.includes('cell'))
    return 'Add Cell'

  if (props.allowedTypes.includes('row'))
    return props.allowedTypes.length === 1 ? 'Add Row' : 'Add Item'

  return 'Add Item'
})

const shouldOpenMenu = computed(
  () => buttonLabel.value === 'Add Item' && props.allowedTypes.length > 1,
)

function handleQuickInsert() {
  if (!defaultInsertType.value)
    return

  emit('select', defaultInsertType.value)
}
</script>

<template>
  <div
    data-slot="tree-insert-line"
    class="group pointer-events-none absolute left-0 right-0 z-10 h-6 -translate-y-1/2 transition-opacity duration-200"
    :class="props.visible ? 'opacity-100' : 'opacity-0'"
  >
    <span
      v-if="props.allowedTypes.length"
      class="absolute top-1/2 right-0 h-0.5 -translate-y-1/2 bg-primary/40 transition-[left,background-color] group-hover:bg-primary/60"
      :style="{ left: `${props.left}px` }"
    />

    <TreeInsertMenu
      v-if="props.allowedTypes.length && shouldOpenMenu"
      :allowed-types="props.allowedTypes"
      @select="(type) => emit('select', type)"
      @open-change="(val) => emit('openChange', val)"
    >
      <button
        type="button"
        :aria-label="buttonLabel"
        class="absolute inset-0 z-10 h-6 w-full cursor-pointer"
        :class="props.visible ? 'pointer-events-auto' : 'pointer-events-none'"
      >
        <span
          class="absolute inset-x-0 top-0 h-1.5"
          @mousemove.stop
        />
        <span
          class="absolute inset-x-0 bottom-0 h-1.5"
          @mousemove.stop
        />
      </button>
    </TreeInsertMenu>

    <button
      v-else-if="props.allowedTypes.length"
      type="button"
      :aria-label="buttonLabel"
      class="absolute inset-0 z-10 h-6 w-full cursor-pointer"
      :class="props.visible ? 'pointer-events-auto' : 'pointer-events-none'"
      @click="handleQuickInsert"
    >
      <span
        class="absolute inset-x-0 top-0 h-1.5"
        @mousemove.stop
      />
      <span
        class="absolute inset-x-0 bottom-0 h-1.5"
        @mousemove.stop
      />
    </button>

    <span
      v-if="props.allowedTypes.length"
      aria-hidden="true"
      class="pointer-events-none absolute top-1/2 left-1/2 z-20 inline-flex h-6 -translate-x-1/2 -translate-y-1/2 items-center whitespace-nowrap rounded-full border border-primary/40 bg-background px-2 text-[10px] font-bold uppercase tracking-wider text-primary shadow-sm"
    >
      {{ buttonLabel }}
    </span>
  </div>
</template>
