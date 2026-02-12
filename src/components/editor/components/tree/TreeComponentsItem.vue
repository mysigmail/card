<script setup lang="ts">
import type { ToolGroupBucket } from '@/store/components/utils'
import { Copy, Trash2 } from 'lucide-vue-next'
import { computed } from 'vue'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { useComponentsStore } from '@/store/components'

interface Props {
  id: string
  name: string
  index: number
  groups: ToolGroupBucket[]
}

const props = defineProps<Props>()

const { onEditTool, editableToolsGroupName, editableId, removeComponent, duplicateComponent }
  = useComponentsStore()

const layoutGroupId = computed(() => {
  return props.groups.find(group => group.role === 'layout')?.id || props.groups[0]?.id
})

function onClick(type: 'copy' | 'remove') {
  if (type === 'remove')
    removeComponent(props.index)

  if (type === 'copy')
    duplicateComponent(props.index)
}

function onHeaderClick() {
  if (!layoutGroupId.value)
    return

  onEditTool(layoutGroupId.value, props.index)
}
</script>

<template>
  <div
    class="relative select-none _pt-1.5"
    :class="
      id === editableId
        ? `before:absolute before:inset-y-0 before:left-0 before:w-0.5 before:bg-primary before:content-['']`
        : ''
    "
  >
    <div>
      <div
        class="flex cursor-pointer items-center justify-between px-4 py-3"
        @click="onHeaderClick"
      >
        {{ name }}
        <div class="flex">
          <ButtonGroup>
            <Button
              variant="outline"
              size="icon-xs"
              aria-label="More Options"
              @click.stop="onClick('copy')"
            >
              <Copy class="size-3" />
            </Button>
            <Button
              variant="outline"
              size="icon-xs"
              aria-label="More Options"
              @click.stop="onClick('remove')"
            >
              <Trash2 class="size-3 text-destructive" />
            </Button>
          </ButtonGroup>
        </div>
      </div>
      <div class="tools">
        <div
          v-for="group in groups"
          :key="group.id"
          class="cursor-pointer px-6 py-1 text-xs text-muted-foreground first:pt-0 hover:text-foreground"
          :class="{
            'text-foreground!': group.id === editableToolsGroupName && id === editableId,
          }"
          @click="onEditTool(group.id, index)"
        >
          {{ group.label }}
        </div>
      </div>
    </div>
  </div>
</template>
