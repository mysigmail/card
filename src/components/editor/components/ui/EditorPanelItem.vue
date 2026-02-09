<script setup lang="ts">
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
    class="app-collapse-item"
    :class="{ 'is-bordered': rootType === 'bordered' }"
  >
    <div
      class="header"
      @click="onOpen"
    >
      <div class="title">
        {{ title }}
      </div>
      <div
        v-if="showActions"
        class="actions"
      >
        <EditorActionButton
          type="danger"
          @click.stop="onClick('delete')"
        >
          <UniconsTrashAlt />
        </EditorActionButton>
      </div>
      <UniconsAngleRight
        v-if="type === 'collapsed'"
        class="icon"
        :class="{ 'is-open': isOpen }"
      />
    </div>
    <div
      v-if="isShow"
      class="body"
    >
      <slot />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.app-collapse-item {
  padding: 0 var(--spacing-sm);
  border-bottom: 1px solid var(--color-border);
  .is-bordered {
    border: 1px solid var(--color-border);
    margin-bottom: var(--spacing-xs);
    border-radius: 3px;
  }
  .header {
    padding: var(--spacing-sm) 0;
    display: flex;
    cursor: pointer;
    user-select: none;
    .title {
      flex-grow: 1;
      font-weight: bold;
      text-transform: uppercase;
      color: var(--color-contrast-high);
    }
    .icon {
      fill: var(--color-contrast-middle);
      &.is-open {
        transform: rotate(90deg);
      }
    }
  }
  .body {
    padding-bottom: var(--spacing-xs);
  }
  .actions {
    margin-right: var(--spacing-xs);
  }
}
</style>
