<script setup lang="ts">
import type { AtomType } from '@/entities/block'
import {
  Grid2x2,
  Image as ImageIcon,
  LayoutGrid,
  List,
  Minus,
  MousePointerClick,
  Text,
} from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'

interface Props {
  allowedTypes: Array<AtomType | 'row' | 'cell' | 'block'>
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'select', type: AtomType | 'row' | 'cell' | 'block'): void
  (e: 'openChange', open: boolean): void
}>()

function onSelect(type: AtomType | 'row' | 'cell' | 'block') {
  emit('select', type)
}
</script>

<template>
  <DropdownMenu @update:open="(val) => emit('openChange', val)">
    <DropdownMenuTrigger as-child>
      <slot />
    </DropdownMenuTrigger>
    <DropdownMenuContent align="center">
      <template
        v-for="type in props.allowedTypes"
        :key="type"
      >
        <DropdownMenuItem @select="onSelect(type)">
          <template v-if="type === 'block'">
            <LayoutGrid class="mr-2 size-4" />
            <span>Block</span>
          </template>
          <template v-else-if="type === 'row'">
            <Grid2x2 class="mr-2 size-4" />
            <span>Row</span>
          </template>
          <template v-else-if="type === 'cell'">
            <LayoutGrid class="mr-2 size-4" />
            <span>Cell</span>
          </template>
          <template v-else-if="type === 'text'">
            <Text class="mr-2 size-4" />
            <span>Text</span>
          </template>
          <template v-else-if="type === 'button'">
            <MousePointerClick class="mr-2 size-4" />
            <span>Button</span>
          </template>
          <template v-else-if="type === 'image'">
            <ImageIcon class="mr-2 size-4" />
            <span>Image</span>
          </template>
          <template v-else-if="type === 'menu'">
            <List class="mr-2 size-4" />
            <span>Menu</span>
          </template>
          <template v-else-if="type === 'divider'">
            <Minus class="mr-2 size-4" />
            <span>Divider</span>
          </template>
        </DropdownMenuItem>
      </template>
    </DropdownMenuContent>
  </DropdownMenu>
</template>
