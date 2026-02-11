<script setup lang="ts">
import { ChevronRight, Trash2 } from 'lucide-vue-next'
import { computed, inject, ref } from 'vue'

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
    :class="
      rootType === 'bordered'
        ? 'mb-2 rounded-[3px] border border-border px-4'
        : 'border-b border-border px-4'
    "
  >
    <div
      class="flex cursor-pointer select-none py-4"
      @click="onOpen"
    >
      <div class="grow font-bold text-foreground uppercase">
        {{ title }}
      </div>
      <div
        v-if="showActions"
        class="mr-2"
      >
        <EditorActionButton
          type="danger"
          @click.stop="onClick('delete')"
        >
          <Trash2 :size="16" />
        </EditorActionButton>
      </div>
      <ChevronRight
        v-if="type === 'collapsed'"
        class="text-muted-foreground transition-transform"
        :size="16"
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
