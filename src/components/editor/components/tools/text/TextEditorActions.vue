<script setup lang="ts">
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Link,
  Strikethrough,
  Type,
  Underline,
} from 'lucide-vue-next'
import { computed } from 'vue'
import { useEditor } from '@/components/editor/components/tools/text/composables'
import { ColorPicker } from '@/components/ui/color-picker'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'

const { align, bold, editor, fontSize, italic, link, strike, textColor, underline } = useEditor()

const pressets = ['#F56C6C', '#E6A23C', '#67C23A', '#396BDD', '#000000', '#FFFFFF']

const styleValues = computed<string[]>({
  get() {
    return [
      editor.value?.isActive('bold') ? 'bold' : '',
      editor.value?.isActive('italic') ? 'italic' : '',
      editor.value?.isActive('underline') ? 'underline' : '',
      editor.value?.isActive({ textDecoration: 'line-through' }) ? 'strike' : '',
    ].filter(Boolean)
  },
  set(nextValues) {
    if (!editor.value)
      return

    const hasValue = (value: string) => nextValues.includes(value)

    if (hasValue('bold') !== editor.value.isActive('bold'))
      bold()
    if (hasValue('italic') !== editor.value.isActive('italic'))
      italic()
    if (hasValue('underline') !== editor.value.isActive('underline'))
      underline()
    if (hasValue('strike') !== editor.value.isActive({ textDecoration: 'line-through' }))
      strike()
  },
})

const alignValue = computed<string>({
  get() {
    if (editor.value?.isActive({ textAlign: 'center' }))
      return 'center'
    if (editor.value?.isActive({ textAlign: 'right' }))
      return 'right'
    if (editor.value?.isActive({ textAlign: 'justify' }))
      return 'justify'
    return 'left'
  },
  set(nextValue) {
    if (!nextValue)
      return
    align(nextValue as 'left' | 'center' | 'right' | 'justify')
  },
})

const linkValue = computed<string>({
  get() {
    return link.value ? 'link' : ''
  },
  set(nextValue) {
    if (!nextValue)
      link.value = ''
  },
})
</script>

<template>
  <div class="grid gap-3 border-b border-border pb-3">
    <div class="flex items-center gap-2">
      <ToggleGroup
        v-model="styleValues"
        type="multiple"
        variant="outline"
        size="sm"
      >
        <ToggleGroupItem value="bold">
          <Bold :size="14" />
        </ToggleGroupItem>
        <ToggleGroupItem value="italic">
          <Italic :size="14" />
        </ToggleGroupItem>
        <ToggleGroupItem value="underline">
          <Underline :size="14" />
        </ToggleGroupItem>
        <ToggleGroupItem value="strike">
          <Strikethrough :size="14" />
        </ToggleGroupItem>
      </ToggleGroup>

      <Popover>
        <PopoverTrigger as-child>
          <ToggleGroup
            v-model="linkValue"
            type="single"
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="link">
              <Link :size="14" />
            </ToggleGroupItem>
          </ToggleGroup>
        </PopoverTrigger>
        <PopoverContent>
          <Input
            v-model="link"
            placeholder="Type a link"
          />
        </PopoverContent>
      </Popover>

      <ToggleGroup
        v-model="alignValue"
        :spacing="0"
        type="single"
        variant="outline"
        size="sm"
      >
        <ToggleGroupItem value="left">
          <AlignLeft :size="14" />
        </ToggleGroupItem>
        <ToggleGroupItem value="center">
          <AlignCenter :size="14" />
        </ToggleGroupItem>
        <ToggleGroupItem value="right">
          <AlignRight :size="14" />
        </ToggleGroupItem>
        <ToggleGroupItem value="justify">
          <AlignJustify :size="14" />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>

    <div class="flex items-center gap-2">
      <ColorPicker
        v-model="textColor"
        :presets="pressets"
        size="sm"
      />

      <div
        class="flex h-8 w-[172px] items-center rounded-md border border-input bg-background px-2"
      >
        <Type
          :size="14"
          class="mr-2 text-muted-foreground"
        />
        <input
          v-model.number="fontSize"
          class="h-full w-full bg-transparent text-xs outline-none"
          min="1"
          step="1"
          type="number"
        >
        <span class="ml-2 text-xs text-muted-foreground">px</span>
      </div>
    </div>
  </div>
</template>
