<template>
  <div class="input-tool">
    <EditorToolLabel>
      {{ title }}
    </EditorToolLabel>
    <div class="body">
      <ElInput
        v-model="localValue"
        :type="type"
        @input="onInput"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useComponentsStore } from '@/store/components'
import { inject, ref, watch } from 'vue'

interface Props {
  id: string
  value: string | number | null
  type: 'string' | 'number'
  title: string
  updateParentLabel?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'string'
})

const parentMultiToolId = inject<string>('parentMultiToolId')

const componentsStore = useComponentsStore()

const localValue = ref(props.value)

console.log(parentMultiToolId)

watch(
  () => props.value,
  () => {
    localValue.value = props.value
  },
  { deep: true }
)

const onInput = () => {
  componentsStore.updateToolById<string | number | null>(
    props.id,
    'value',
    localValue.value
  )

  if (props.updateParentLabel && parentMultiToolId) {
    componentsStore.updateToolById<string | number | null>(
      parentMultiToolId,
      'label',
      localValue.value
    )
  }
}
</script>

<style lang="scss" scoped></style>
