<script setup lang="ts">
import type { BorderSideValue, BorderValue } from '@/entities/style'
import { PanelBottom, PanelLeft, PanelRight, PanelTop, Scan } from 'lucide-vue-next'
import { computed, ref, watch } from 'vue'
import {
  BORDER_SIDES,
  createDefaultBorder,
  createDefaultBorderSide,
  normalizeBorderValue,
} from '@/entities/style'
import { Button } from '@/shared/ui/button'
import { Switch } from '@/shared/ui/switch'
import { ToggleGroup, ToggleGroupItem } from '@/shared/ui/toggle-group'

const props = defineProps<{ id: string, title: string, value?: BorderValue }>()
const emit = defineEmits<{ (event: 'update:value', value: BorderValue | undefined): void }>()

type BorderSide = (typeof BORDER_SIDES)[number]

function hasAdvancedConfiguration(value?: BorderValue) {
  if (!value)
    return false
  const values = BORDER_SIDES.map(side => value[side])
  if (values.some(side => !side))
    return true
  const [first, ...rest] = values as BorderSideValue[]
  return rest.some(
    side =>
      side.width !== first.width || side.style !== first.style || side.color !== first.color,
  )
}

const advanced = ref(hasAdvancedConfiguration(props.value))
const selectedSide = ref<BorderSide>('top')
const enabled = computed(() => props.value !== undefined)
const enabledSides = computed(() => BORDER_SIDES.filter(side => props.value?.[side]))
const representative = computed(() => {
  const side = enabledSides.value[0]
  return side ? props.value?.[side] : undefined
})
const selectedSideValue = computed(() => props.value?.[selectedSide.value])
const selectedControlValue = computed<BorderSideValue>(
  () =>
    selectedSideValue.value ?? {
      ...(representative.value ?? createDefaultBorderSide()),
      width: 0,
    },
)
const mixed = computed(() => hasAdvancedConfiguration(props.value))

watch(
  () => props.value,
  (value) => {
    if (hasAdvancedConfiguration(value))
      advanced.value = true
  },
  { deep: true },
)

function emitBorder(value: BorderValue | undefined) {
  if (value === undefined) {
    emit('update:value', undefined)
    return
  }
  if (Object.keys(value).length === 0) {
    emit('update:value', undefined)
    return
  }
  const normalized = normalizeBorderValue(value)
  if (normalized)
    emit('update:value', normalized)
}

function setEnabled(value: boolean) {
  emitBorder(value ? createDefaultBorder() : undefined)
}

function setAdvanced(value: boolean) {
  advanced.value = value
}

function isBorderSide(value: unknown): value is BorderSide {
  return typeof value === 'string' && (BORDER_SIDES as readonly string[]).includes(value)
}

function setSelectedSide(value: unknown) {
  if (isBorderSide(value))
    selectedSide.value = value
}

function updateGlobalValue(patch: Partial<BorderSideValue>) {
  if (!representative.value)
    return
  const value = { ...representative.value, ...patch }
  const border: BorderValue = {}
  for (const side of BORDER_SIDES) border[side] = { ...value }
  emitBorder(border)
}

function updateSelectedSideValue(patch: Partial<BorderSideValue>) {
  if (!props.value)
    return
  const border: BorderValue = { ...props.value }
  if (patch.width === 0) {
    delete border[selectedSide.value]
    emitBorder(border)
    return
  }
  const fallback = selectedSideValue.value ?? representative.value ?? createDefaultBorderSide()
  if (!selectedSideValue.value && patch.width === undefined)
    return
  emitBorder({
    ...border,
    [selectedSide.value]: { ...fallback, ...patch },
  })
}

const SIDE_ICONS = {
  top: PanelTop,
  right: PanelRight,
  bottom: PanelBottom,
  left: PanelLeft,
} as const
</script>

<template>
  <div
    data-slot="border-settings"
    class="space-y-3"
  >
    <div class="flex items-center gap-2">
      <div class="flex min-w-0 grow items-center gap-2">
        <EditorToolLabel class="grow">
          {{ title }}
        </EditorToolLabel>
      </div>
      <Switch
        class="ml-2"
        :model-value="enabled"
        aria-label="Enable border"
        @update:model-value="setEnabled"
      />
    </div>

    <div
      v-if="enabled"
      class="space-y-3"
    >
      <div class="flex items-center justify-between gap-2">
        <EditorToolLabel level="parameter">
          {{ advanced ? 'Individual sides' : 'All sides' }}
        </EditorToolLabel>
        <Button
          variant="ghost"
          size="icon-xs"
          :aria-pressed="advanced"
          aria-label="Edit individual border sides"
          :title="advanced ? 'Use one border style' : 'Edit individual border sides'"
          @click="setAdvanced(!advanced)"
        >
          <Scan class="size-3.5" />
        </Button>
      </div>

      <BorderValueControls
        v-if="representative && !advanced && !mixed"
        :id="id"
        :value="representative"
        @update:value="updateGlobalValue"
      />

      <Button
        v-if="!advanced && mixed"
        variant="secondary"
        size="sm"
        class="w-full justify-between text-xs text-muted-foreground"
        @click="setAdvanced(true)"
      >
        <span>Mixed sides</span>
        <span>Edit sides</span>
      </Button>

      <template v-if="advanced">
        <ToggleGroup
          type="single"
          variant="outline"
          size="sm"
          :spacing="0"
          class="w-full"
          :model-value="selectedSide"
          aria-label="Border side"
          @update:model-value="setSelectedSide"
        >
          <ToggleGroupItem
            v-for="side in BORDER_SIDES"
            :key="side"
            :value="side"
            :aria-label="`Border ${side}`"
            class="flex-1"
          >
            <component
              :is="SIDE_ICONS[side]"
              class="size-4"
            />
          </ToggleGroupItem>
        </ToggleGroup>

        <BorderValueControls
          :id="`${id}-${selectedSide}`"
          :value="selectedControlValue"
          allow-zero
          @update:value="updateSelectedSideValue"
        />
      </template>
    </div>
  </div>
</template>
