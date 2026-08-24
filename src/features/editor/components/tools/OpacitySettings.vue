<script setup lang="ts">
import { Blend } from 'lucide-vue-next'
import { ref, watch } from 'vue'
import { normalizeOpacity } from '@/entities/style'
import { Input } from '@/shared/ui/input'
import ScrubbableNumberField from './number/ScrubbableNumberField.vue'

const props = defineProps<{ compact?: boolean, id: string, title: string, value: number }>()
const emit = defineEmits<{ (event: 'update:value', value: number): void }>()

const draft = ref<string | number>(props.value)

watch(
  () => props.value,
  (value) => {
    draft.value = value
  },
)

function update(value: string | number) {
  draft.value = value
  const opacity = parseDraft(value)
  if (opacity !== undefined)
    emit('update:value', opacity)
}

function parseDraft(value: string | number) {
  if (typeof value === 'string' && value.trim() === '')
    return undefined
  return normalizeOpacity(Number(value))
}

function restoreInvalidDraft() {
  if (parseDraft(draft.value) === undefined)
    draft.value = props.value
}

function updateScrubbed(value: number | undefined) {
  const opacity = normalizeOpacity(value)
  if (opacity !== undefined)
    emit('update:value', opacity)
}
</script>

<template>
  <div
    data-slot="opacity-settings"
    :class="compact ? 'space-y-1' : 'space-y-2'"
  >
    <EditorToolLabel>
      {{ title }}
    </EditorToolLabel>
    <ScrubbableNumberField
      v-if="compact"
      :model-value="value"
      :default-value="100"
      :label="title"
      :min="0"
      :max="100"
      :step="1"
      @update:model-value="updateScrubbed"
    >
      <template #prefix>
        <Blend />
      </template>
    </ScrubbableNumberField>
    <div
      v-else
      class="relative"
    >
      <Input
        :id="id"
        v-model="draft"
        size="sm"
        type="number"
        min="0"
        max="100"
        step="1"
        class="pr-8"
        :aria-invalid="parseDraft(draft) === undefined"
        aria-label="Opacity"
        @update:model-value="update"
        @blur="restoreInvalidDraft"
      />
      <span
        class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground"
      >
        %
      </span>
    </div>
  </div>
</template>
