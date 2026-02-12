<script setup lang="ts">
import { ChevronRight, Trash2 } from 'lucide-vue-next'
import { computed, inject, ref } from 'vue'
import { Button } from '@/components/ui/button'

interface Props {
  title: string
  showActions?: boolean
  type?: 'collapsed' | 'opened'
}

const props = withDefaults(defineProps<Props>(), {
  showActions: false,
  type: 'collapsed',
})

const emit = defineEmits<Emits>()

interface Emits {
  (e: 'action', value: string): void
}

const rootType = inject<'default' | 'bordered'>('type')

const isOpen = ref(false)

const isShow = computed(() => {
  if (props.type === 'collapsed')
    return isOpen.value

  return true
})

function onOpen() {
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
    <div
      :data-type="type"
      class="flex items-center cursor-pointer select-none pt-4 pb-1 data-[type=collapsed]:py-2"
      @click="onOpen"
    >
      <div class="grow font-bold text-foreground uppercase">
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
      <ChevronRight
        v-if="type === 'collapsed'"
        class="size-4 text-muted-foreground transition-transform"
        :class="{ 'rotate-90': isOpen }"
      />
    </div>
    <div
      v-if="isShow"
      class="pb-2"
    >
      <slot />
    </div>
  </div>
</template>
