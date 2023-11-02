<template>
  <Transition name="fade">
    <div v-if="show" class="p-overflow" _style="main">
      <div class="p-overflow__left">
        <Transition name="slide-fade-left" appear>
          <div v-if="show">
            <div class="p-overflow__name" _style="toolsItem">
              {{ component?.label }}
            </div>
          </div>
        </Transition>
      </div>
      <div class="p-overflow__right">
        <Transition name="slide-fade-right" appear>
          <div v-if="show" class="p-overflow-tools" _style="tools">
            <div
              class="p-overflow-tools__item"
              _style="toolsItem"
              @click.stop="onClick('edit')"
            >
              <UniconsPen />
            </div>
            <div
              class="p-overflow-tools__item"
              _style="toolsItem"
              @click.stop="onClick('copy')"
            >
              <UniconsCopy />
            </div>
            <div
              class="p-overflow-tools__item"
              _style="toolsItem"
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

const componentStore = useComponentsStore()

const component = computed(() => componentStore.installed?.[props.index])

function onClick(type: 'edit' | 'copy' | 'remove') {
  if (!component.value)
    return

  if (type === 'edit')
    componentStore.setEditable(component.value)

  if (type === 'remove')
    componentStore.remove(props.index)

  if (type === 'copy')
    componentStore.duplicateComponent(component.value, props.index)
}
</script>
