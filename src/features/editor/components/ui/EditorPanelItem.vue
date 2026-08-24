<script setup lang="ts">
import { ChevronRight, Trash2 } from 'lucide-vue-next'
import { computed, inject, toRef } from 'vue'
import { Button } from '@/shared/ui/button'
import { useInspectorSectionState } from './use-inspector-section-state'

interface Props {
  defaultOpen?: boolean
  summary?: string
  title: string
  showActions?: boolean
  stateKey?: string
  type?: 'collapsed' | 'opened'
}

const props = withDefaults(defineProps<Props>(), {
  defaultOpen: false,
  showActions: false,
  type: 'collapsed',
})

const emit = defineEmits<Emits>()

interface Emits {
  (e: 'action', value: string): void
}

const rootType = inject<'default' | 'bordered'>('type')

const isOpen = useInspectorSectionState(toRef(props, 'stateKey'), toRef(props, 'defaultOpen'))

const isShow = computed(() => {
  if (props.type === 'collapsed')
    return isOpen.value

  return true
})

function onOpen() {
  if (props.type !== 'collapsed')
    return

  isOpen.value = !isOpen.value
}

function onClick(action: string) {
  emit('action', action)
}
</script>

<template>
  <div
    data-slot="editor-panel-item"
    :data-type="type"
    :class="
      rootType === 'bordered'
        ? 'mb-2 rounded-sm border border-border px-4'
        : 'border-b border-border px-4'
    "
  >
    <div class="flex items-center">
      <button
        v-if="type === 'collapsed'"
        type="button"
        class="flex min-w-0 grow cursor-pointer items-center py-3 text-left select-none"
        :aria-expanded="isOpen"
        @click="onOpen"
      >
        <span class="grow font-bold text-foreground uppercase">
          {{ title }}
        </span>
        <span
          v-if="summary && !isOpen"
          class="mr-2 truncate text-xs font-normal text-muted-foreground normal-case"
        >
          {{ summary }}
        </span>
        <ChevronRight
          class="size-4 shrink-0 text-muted-foreground transition-transform"
          :class="{ 'rotate-90': isOpen }"
        />
      </button>
      <div
        v-else
        class="min-w-0 grow pt-4 pb-1 font-bold text-foreground uppercase"
      >
        {{ title }}
      </div>
      <div
        v-if="showActions"
        class="mr-2"
      >
        <Button
          variant="ghost"
          size="icon-sm"
          @click.stop="onClick('delete')"
        >
          <Trash2 class="size-4 text-muted-foreground hover:text-destructive" />
        </Button>
      </div>
    </div>
    <div
      v-if="isShow"
      class="pb-2"
    >
      <slot />
    </div>
  </div>
</template>
