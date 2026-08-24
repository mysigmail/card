<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { FontOption } from '@/entities/font'
import { Check, ChevronsUpDown } from 'lucide-vue-next'
import { computed, ref } from 'vue'
import {
  createGoogleFontStack,
  googleFontFamilies,
  resolveGoogleFontFromStack,
  SYSTEM_FONT_OPTIONS,
} from '@/entities/font'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/shared/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'

interface PickerOption extends FontOption {
  disabled?: boolean
}

const props = withDefaults(
  defineProps<{
    modelValue: string
    ariaLabel?: string
    triggerClass?: HTMLAttributes['class']
    systemOptions?: FontOption[]
    specialOptions?: PickerOption[]
  }>(),
  {
    ariaLabel: 'Font family',
    systemOptions: () => SYSTEM_FONT_OPTIONS,
    specialOptions: () => [],
  },
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: string): void
}>()

const INITIAL_GOOGLE_FONT_LIMIT = 40
const SEARCH_RESULT_LIMIT = 100

const open = ref(false)
const query = ref('')
const normalizedQuery = computed(() => query.value.trim().toLocaleLowerCase())
const selectedGoogleFamily = computed(() => resolveGoogleFontFromStack(props.modelValue)?.family)

const selectedLabel = computed(() => {
  return (
    props.specialOptions.find(option => option.value === props.modelValue)?.label
    ?? props.systemOptions.find(option => option.value === props.modelValue)?.label
    ?? selectedGoogleFamily.value
    ?? props.modelValue
  )
})

const selectedOption = computed<PickerOption>(() => ({
  label: selectedLabel.value,
  value: props.modelValue,
  disabled: props.specialOptions.find(option => option.value === props.modelValue)?.disabled,
}))

function matchesQuery(label: string) {
  return !normalizedQuery.value || label.toLocaleLowerCase().includes(normalizedQuery.value)
}

const visibleSelectedOption = computed(() => matchesQuery(selectedOption.value.label))
const visibleSpecialOptions = computed(() =>
  props.specialOptions.filter((option) => {
    return option.value !== props.modelValue && matchesQuery(option.label)
  }),
)
const visibleSystemFonts = computed(() =>
  props.systemOptions.filter((option) => {
    return option.value !== props.modelValue && matchesQuery(option.label)
  }),
)
const visibleGoogleFonts = computed(() => {
  const matching = normalizedQuery.value
    ? googleFontFamilies.filter(font => matchesQuery(font.family))
    : googleFontFamilies
  return matching
    .filter(font => font.family !== selectedGoogleFamily.value)
    .slice(0, normalizedQuery.value ? SEARCH_RESULT_LIMIT : INITIAL_GOOGLE_FONT_LIMIT)
})

function selectFont(value: string) {
  emit('update:modelValue', value)
  open.value = false
  query.value = ''
}
</script>

<template>
  <div data-slot="font-family-picker">
    <Popover v-model:open="open">
      <PopoverTrigger as-child>
        <Button
          variant="outline"
          size="sm"
          :class="cn('w-full justify-between font-normal', triggerClass)"
          role="combobox"
          :aria-label="ariaLabel"
          :aria-expanded="open"
        >
          <span class="flex min-w-0 items-center gap-1.5 truncate">
            <slot name="prefix" />
            <span class="truncate">{{ selectedLabel }}</span>
          </span>
          <ChevronsUpDown class="ml-1 size-3.5 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        class="w-(--reka-popover-trigger-width) min-w-72 p-2"
      >
        <Command>
          <CommandInput
            v-model="query"
            placeholder="Search fonts…"
            aria-label="Search fonts"
          />
          <CommandList class="max-h-64">
            <CommandEmpty>No fonts found</CommandEmpty>
            <CommandGroup
              v-if="visibleSelectedOption"
              heading="Current font"
            >
              <CommandItem
                :value="selectedOption.value"
                :disabled="selectedOption.disabled"
                data-current-font
                aria-current="true"
                @select="selectFont(selectedOption.value)"
              >
                <Check class="mr-2 size-4" />
                {{ selectedOption.label }}
              </CommandItem>
            </CommandGroup>
            <CommandGroup
              v-if="visibleSpecialOptions.length"
              heading="Default font"
            >
              <CommandItem
                v-for="option in visibleSpecialOptions"
                :key="option.value"
                :value="option.value"
                :disabled="option.disabled"
                @select="selectFont(option.value)"
              >
                <Check
                  class="mr-2 size-4"
                  :class="modelValue === option.value ? 'opacity-100' : 'opacity-0'"
                />
                {{ option.label }}
              </CommandItem>
            </CommandGroup>
            <CommandGroup
              v-if="visibleSystemFonts.length"
              heading="System fonts"
            >
              <CommandItem
                v-for="option in visibleSystemFonts"
                :key="option.value"
                :value="option.value"
                @select="selectFont(option.value)"
              >
                <Check
                  class="mr-2 size-4"
                  :class="modelValue === option.value ? 'opacity-100' : 'opacity-0'"
                />
                {{ option.label }}
              </CommandItem>
            </CommandGroup>
            <CommandGroup
              v-if="visibleGoogleFonts.length"
              heading="Google Fonts"
            >
              <CommandItem
                v-for="font in visibleGoogleFonts"
                :key="font.family"
                :value="createGoogleFontStack(font)"
                @select="selectFont(createGoogleFontStack(font))"
              >
                <Check
                  class="mr-2 size-4"
                  :class="selectedGoogleFamily === font.family ? 'opacity-100' : 'opacity-0'"
                />
                {{ font.family }}
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  </div>
</template>
