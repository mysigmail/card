<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { ColorPickerSize } from '.'
import { useVModel } from '@vueuse/core'
import { ChevronDown } from 'lucide-vue-next'
import { computed } from 'vue'
import { cn } from '@/shared/lib/utils'
import { Input } from '@/shared/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { colorPickerSizes } from '.'
import 'vanilla-colorful'

interface Props {
  class?: HTMLAttributes['class']
  modelValue?: string
  defaultValue?: string
  presets?: string[]
  size?: ColorPickerSize
  showInput?: boolean
  showReset?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  defaultValue: '',
  presets: () => ['#F56C6C', '#E6A23C', '#67C23A', '#396BDD', '#000000', '#FFFFFF'],
  size: 'default',
  showInput: true,
  showReset: true,
})

const emits = defineEmits<{
  (e: 'update:modelValue', payload: string): void
}>()

const modelValue = useVModel(props, 'modelValue', emits, {
  passive: true,
  defaultValue: props.defaultValue,
})

const pickerColor = computed(() => modelValue.value || '#000000')
const sizeClasses = computed(() => colorPickerSizes[props.size])

function onChange(event: Event & { target: { color: string } }) {
  modelValue.value = event.target.color
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <div
        data-slot="color-picker-trigger"
        :class="
          cn(
            'inline-flex cursor-pointer items-center rounded-md border border-input bg-background shadow-xs transition-[color,box-shadow] outline-none',
            sizeClasses.trigger,
            props.class,
          )
        "
      >
        <div
          :class="
            cn(
              'relative shrink-0 rounded-sm border border-input bg-white p-0.5',
              sizeClasses.swatch,
            )
          "
        >
          <div
            class="size-full rounded-[2px] border border-black/5"
            :style="{ backgroundColor: modelValue || 'transparent' }"
          />
          <span
            v-if="!modelValue"
            class="absolute inset-0 flex items-center justify-center text-md leading-none text-muted-foreground select-none"
          >
            ×
          </span>
        </div>
        <ChevronDown
          :class="cn('shrink-0 text-muted-foreground', sizeClasses.chevron)"
          aria-hidden="true"
        />
      </div>
    </PopoverTrigger>
    <PopoverContent class="w-auto">
      <div class="space-y-2">
        <hex-color-picker
          data-color-picker
          class="w-auto"
          :color="pickerColor"
          @color-changed="onChange"
        />
        <div
          v-if="showReset || presets.length"
          class="flex flex-wrap gap-2"
        >
          <div
            v-if="showReset"
            class="size-6 cursor-pointer rounded border border-input bg-background text-center text-xs leading-6 text-muted-foreground"
            @click="modelValue = ''"
          >
            ×
          </div>
          <div
            v-for="preset in presets"
            :key="preset"
            class="size-6 cursor-pointer rounded border border-input"
            :style="{ backgroundColor: preset }"
            @click="modelValue = preset"
          />
        </div>
        <Input
          v-if="showInput"
          v-model="modelValue"
        />
      </div>
    </PopoverContent>
  </Popover>
</template>

<style scoped>
[data-color-picker]::part(saturation) {
  border-radius: 6px 6px 0 0;
}

[data-color-picker]::part(hue) {
  border-radius: 0 0 6px 6px;
}
</style>
