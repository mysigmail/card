<script setup lang="ts">
import type { AtomType } from '@/entities/block'
import { computed } from 'vue'
import TreeInsertMenu from '@/features/editor/components/tree/TreeInsertMenu.vue'

interface Props {
  visible?: boolean
  allowedTypes: Array<AtomType | 'row' | 'cell' | 'block'>
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
})

const emit = defineEmits<{
  (e: 'select', type: AtomType | 'row' | 'cell' | 'block'): void
  (e: 'openChange', open: boolean): void
}>()

const defaultInsertType = computed(() => props.allowedTypes[0])
const buttonLabel = computed(() => {
  if (props.allowedTypes.includes('block'))
    return 'Add Block'
  if (props.allowedTypes.includes('cell'))
    return 'Add Cell'
  if (props.allowedTypes.includes('row')) {
    return props.allowedTypes.length === 1 ? 'Add Row' : 'Add Item'
  }
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
    class="absolute left-0 right-0 z-10 -translate-y-1/2 transition-opacity duration-200"
    :class="props.visible ? 'opacity-100' : 'opacity-0'"
  >
    <TreeInsertMenu
      v-if="props.allowedTypes.length && shouldOpenMenu"
      :allowed-types="props.allowedTypes"
      @select="(type) => emit('select', type)"
      @open-change="(val) => emit('openChange', val)"
    >
      <button
        type="button"
        class="group flex h-6 w-full cursor-pointer items-center"
        :class="props.visible ? 'pointer-events-auto' : 'pointer-events-none'"
      >
        <span
          class="h-0.5 min-w-2 flex-1 bg-primary/40 transition-colors group-hover:bg-primary/60"
        />
        <span
          class="inline-flex h-6 items-center whitespace-nowrap rounded-full border border-primary/40 bg-background px-2 text-[10px] font-bold uppercase tracking-wider text-primary shadow-sm"
        >
          {{ buttonLabel }}
        </span>
        <span
          class="h-0.5 min-w-2 flex-1 bg-primary/40 transition-colors group-hover:bg-primary/60"
        />
      </button>
    </TreeInsertMenu>

    <button
      v-else-if="props.allowedTypes.length"
      type="button"
      class="group flex h-6 w-full cursor-pointer items-center"
      :class="props.visible ? 'pointer-events-auto' : 'pointer-events-none'"
      @click="handleQuickInsert"
    >
      <span
        class="h-0.5 min-w-2 flex-1 bg-primary/40 transition-colors group-hover:bg-primary/60"
      />
      <span
        class="inline-flex h-6 items-center whitespace-nowrap rounded-full border border-primary/40 bg-background px-2 text-[10px] font-bold uppercase tracking-wider text-primary shadow-sm"
      >
        {{ buttonLabel }}
      </span>
      <span
        class="h-0.5 min-w-2 flex-1 bg-primary/40 transition-colors group-hover:bg-primary/60"
      />
    </button>
  </div>
</template>
