<template>
  <Transition name="fade">
    <div
      v-if="show"
      class="p-overflow"
    >
      <div class="p-overflow__left">
        <Transition
          name="slide-fade-left"
          appear
        >
          <div v-if="show">
            <div class="p-overflow__name">
              {{ component?.label }}
            </div>
          </div>
        </Transition>
      </div>
      <div class="p-overflow__right">
        <Transition
          name="slide-fade-right"
          appear
        >
          <div
            v-if="show"
            class="p-overflow-tools"
          >
            <div
              class="p-overflow-tools__item"
              @click.stop="onClick('edit')"
            >
              <UniconsPen />
            </div>
            <div
              class="p-overflow-tools__item"
              @click.stop="onClick('copy')"
            >
              <UniconsCopy />
            </div>
            <div
              class="p-overflow-tools__item"
              @click.stop="onClick('remove')"
            >
              <UniconsTrashAlt />
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useComponentsStore } from '@/store/components'

interface Props {
  show: boolean
  index: number
}

const props = defineProps<Props>()

const { installed, setEditable, removeComponent, duplicateComponent } = useComponentsStore()

const component = computed(() => installed.value?.[props.index])

function onClick(type: 'edit' | 'copy' | 'remove') {
  if (!component.value)
    return

  if (type === 'edit')
    setEditable(component.value)

  if (type === 'remove')
    removeComponent(props.index)

  if (type === 'copy')
    duplicateComponent(component.value, props.index)
}
</script>
