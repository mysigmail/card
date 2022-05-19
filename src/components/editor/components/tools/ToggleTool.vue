<template>
  <div class="toggle-tool">
    <EditorToolLabel>
      {{ title }}
    </EditorToolLabel>
    <ElSwitch v-model="localValue" />
  </div>
</template>

<script setup lang="ts">
import { useComponentsStore } from '@/store/components'
import { ref, watch } from 'vue'

interface Props {
  id: string
  value: boolean
  title: string
}

const props = defineProps<Props>()

const componentsStore = useComponentsStore()

const localValue = ref(props.value)

watch(localValue, () => {
  componentsStore.updateToolById<boolean>(props.id, 'value', localValue.value)
})
</script>

<style lang="scss" scoped></style>
