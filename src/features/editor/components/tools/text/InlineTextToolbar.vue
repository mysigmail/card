<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3'
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Link,
  List,
  ListOrdered,
  RemoveFormatting,
  Strikethrough,
  Subscript,
  Superscript,
  Underline,
} from 'lucide-vue-next'
import { computed, ref } from 'vue'
import { Button } from '@/shared/ui/button'
import { ColorPicker } from '@/shared/ui/color-picker'
import { Input } from '@/shared/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Separator } from '@/shared/ui/separator'
import { Toggle } from '@/shared/ui/toggle'
import { useInlineToolbarPosition } from './composables/use-inline-toolbar-position'
import { INLINE_TEXT_FONT_FAMILIES } from './text-editor-core'

interface Props {
  atomId: string
  editor: Editor
  revision: number
}

defineOptions({ inheritAttrs: false })

const props = defineProps<Props>()
const toolbar = ref<HTMLElement>()
const { toolbarPosition } = useInlineToolbarPosition(props.editor, toolbar)

const DEFAULT_STYLE_VALUE = '__default__'
const FONT_WEIGHTS = ['400', '500', '600', '700', '800', '900']
const LINE_HEIGHTS = ['1', '1.2', '1.4', '1.5', '1.6', '2']
const LETTER_SPACINGS = ['-1px', '0px', '0.5px', '1px', '2px', '4px']
const COLOR_PRESETS = ['#F56C6C', '#E6A23C', '#67C23A', '#396BDD', '#000000', '#FFFFFF']

function textStyleValue(name: string) {
  void props.revision
  return props.editor.getAttributes('textStyle')[name] ?? ''
}

function selectStyleValue(name: string) {
  return textStyleValue(name) || DEFAULT_STYLE_VALUE
}

function markState(
  name: string,
  attributes: Record<string, string> = {},
): 'true' | 'false' | 'mixed' {
  void props.revision
  const { from, to, empty } = props.editor.state.selection
  if (empty)
    return props.editor.isActive(name, attributes) ? 'true' : 'false'

  let marked = false
  let unmarked = false
  props.editor.state.doc.nodesBetween(from, to, (node) => {
    if (!node.isText)
      return

    const matches = node.marks.some((mark) => {
      if (mark.type.name !== name)
        return false

      return Object.entries(attributes).every(([key, value]) => mark.attrs[key] === value)
    })

    if (matches)
      marked = true
    else unmarked = true
  })

  if (marked && unmarked)
    return 'mixed'

  return marked ? 'true' : 'false'
}

function setTextStyle(name: string, value: string) {
  props.editor
    .chain()
    .setMark('textStyle', { [name]: value === DEFAULT_STYLE_VALUE ? null : value })
    .run()
}

function setLink(href: string) {
  if (href.trim())
    props.editor.chain().focus().extendMarkRange('link').setLink({ href: href.trim() }).run()
  else props.editor.chain().focus().extendMarkRange('link').unsetLink().run()
}

function clearFormatting() {
  props.editor.chain().focus().unsetAllMarks().unsetTextAlign().clearNodes().run()
}

function setTextColor(color: string) {
  props.editor.chain().setColor(color).run()
}

const fontSize = computed({
  get() {
    return String(textStyleValue('fontSize')).replace('px', '') || '16'
  },
  set(value: string | number) {
    const nextValue = Number(value)
    if (Number.isFinite(nextValue))
      setTextStyle('fontSize', `${nextValue}px`)
  },
})

function eventInputValue(event: Event) {
  return (event.target as HTMLInputElement).value
}

function stringValue(value: unknown) {
  return typeof value === 'string' ? value : DEFAULT_STYLE_VALUE
}
</script>

<template>
  <div
    ref="toolbar"
    v-bind="$attrs"
    data-slot="inline-text-toolbar"
    :data-inline-text-toolbar="atomId"
    :style="toolbarPosition"
    class="p-inline-text-toolbar fixed z-50 flex w-max max-w-[min(541px,calc(100vw-24px))] flex-wrap items-center gap-1 rounded-lg border border-border bg-popover p-1.5 text-popover-foreground shadow-xl"
    role="toolbar"
    aria-label="Text formatting"
    @mousedown.stop
    @click.stop
  >
    <Toggle
      v-for="item in [
        {
          label: 'Bold',
          state: markState('bold'),
          icon: Bold,
          command: () => editor.chain().focus().toggleBold().run(),
        },
        {
          label: 'Italic',
          state: markState('italic'),
          icon: Italic,
          command: () => editor.chain().focus().toggleItalic().run(),
        },
        {
          label: 'Underline',
          state: markState('underline'),
          icon: Underline,
          command: () => editor.chain().focus().toggleUnderline().run(),
        },
        {
          label: 'Strike',
          state: markState('textStyle', { textDecoration: 'line-through' }),
          icon: Strikethrough,
          command: () =>
            editor.isActive({ textDecoration: 'line-through' })
              ? editor.chain().focus().unsetCustomStrike().run()
              : editor.chain().focus().setCustomStrike().run(),
        },
      ]"
      :key="item.label"
      variant="outline"
      size="sm"
      :model-value="item.state !== 'false'"
      :class="{ 'bg-accent text-accent-foreground': item.state === 'mixed' }"
      :aria-label="item.label"
      :aria-pressed="item.state"
      :title="item.label"
      @mousedown.prevent
      @update:model-value="item.command()"
    >
      <component
        :is="item.icon"
        :size="14"
      />
    </Toggle>

    <Separator
      orientation="vertical"
      class="mx-0.5 h-5"
    />

    <Toggle
      v-for="item in [
        {
          label: 'Align left',
          active: editor.isActive({ textAlign: 'left' }),
          icon: AlignLeft,
          value: 'left',
        },
        {
          label: 'Align center',
          active: editor.isActive({ textAlign: 'center' }),
          icon: AlignCenter,
          value: 'center',
        },
        {
          label: 'Align right',
          active: editor.isActive({ textAlign: 'right' }),
          icon: AlignRight,
          value: 'right',
        },
        {
          label: 'Justify',
          active: editor.isActive({ textAlign: 'justify' }),
          icon: AlignJustify,
          value: 'justify',
        },
      ]"
      :key="item.value"
      variant="outline"
      size="sm"
      :model-value="item.active"
      :aria-label="item.label"
      :title="item.label"
      @mousedown.prevent
      @update:model-value="editor.chain().focus().setTextAlign(item.value).run()"
    >
      <component
        :is="item.icon"
        :size="14"
      />
    </Toggle>

    <Separator
      orientation="vertical"
      class="mx-0.5 h-5"
    />

    <Toggle
      v-for="item in [
        {
          label: 'Bullet list',
          active: editor.isActive('bulletList'),
          icon: List,
          command: () => editor.chain().focus().toggleBulletList().run(),
        },
        {
          label: 'Ordered list',
          active: editor.isActive('orderedList'),
          icon: ListOrdered,
          command: () => editor.chain().focus().toggleOrderedList().run(),
        },
        {
          label: 'Superscript',
          active: editor.isActive('superscript'),
          icon: Superscript,
          command: () => editor.chain().focus().toggleSuperscript().run(),
        },
        {
          label: 'Subscript',
          active: editor.isActive('subscript'),
          icon: Subscript,
          command: () => editor.chain().focus().toggleSubscript().run(),
        },
      ]"
      :key="item.label"
      variant="outline"
      size="sm"
      :model-value="item.active"
      :aria-label="item.label"
      :title="item.label"
      @mousedown.prevent
      @update:model-value="item.command()"
    >
      <component
        :is="item.icon"
        :size="14"
      />
    </Toggle>

    <Popover>
      <PopoverTrigger as-child>
        <Button
          variant="outline"
          size="icon-sm"
          :class="{
            'bg-accent text-accent-foreground': Boolean(editor.getAttributes('link').href),
          }"
          aria-label="Link"
          title="Link"
        >
          <Link :size="14" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        class="w-72 p-2"
        align="start"
      >
        <Input
          size="sm"
          aria-label="Link URL"
          placeholder="https://"
          type="url"
          :model-value="editor.getAttributes('link').href ?? ''"
          @change="setLink(eventInputValue($event))"
        />
      </PopoverContent>
    </Popover>

    <Separator
      orientation="vertical"
      class="mx-0.5 h-5"
    />

    <Button
      variant="outline"
      size="icon-sm"
      aria-label="Clear formatting"
      title="Clear formatting"
      @mousedown.prevent
      @click="clearFormatting"
    >
      <RemoveFormatting :size="14" />
    </Button>

    <div
      class="h-0 basis-full"
      aria-hidden="true"
    />

    <Select
      :model-value="selectStyleValue('fontFamily')"
      @update:model-value="setTextStyle('fontFamily', stringValue($event))"
    >
      <SelectTrigger
        size="sm"
        class="w-[118px] px-2 text-xs"
        aria-label="Font family"
      >
        <SelectValue placeholder="Default" />
      </SelectTrigger>
      <SelectContent
        :body-lock="false"
        :disable-outside-pointer-events="false"
      >
        <SelectItem
          v-for="font in INLINE_TEXT_FONT_FAMILIES"
          :key="font.label"
          :value="font.value || DEFAULT_STYLE_VALUE"
        >
          {{ font.label }}
        </SelectItem>
      </SelectContent>
    </Select>

    <Input
      v-model="fontSize"
      class="w-14 px-2 text-xs"
      size="sm"
      aria-label="Font size"
      title="Font size"
      type="number"
      min="1"
      max="250"
    />

    <Select
      v-for="control in [
        {
          label: 'Font weight',
          name: 'fontWeight',
          placeholder: 'Weight',
          width: 'w-[78px]',
          values: FONT_WEIGHTS,
        },
        {
          label: 'Line height',
          name: 'lineHeight',
          placeholder: 'Line',
          width: 'w-[68px]',
          values: LINE_HEIGHTS,
        },
        {
          label: 'Letter spacing',
          name: 'letterSpacing',
          placeholder: 'Spacing',
          width: 'min-w-[82px] flex-1',
          values: LETTER_SPACINGS,
        },
      ]"
      :key="control.name"
      :model-value="selectStyleValue(control.name)"
      @update:model-value="setTextStyle(control.name, stringValue($event))"
    >
      <SelectTrigger
        size="sm"
        class="px-2 text-xs"
        :class="control.width"
        :aria-label="control.label"
      >
        <SelectValue :placeholder="control.placeholder" />
      </SelectTrigger>
      <SelectContent
        :body-lock="false"
        :disable-outside-pointer-events="false"
      >
        <SelectItem :value="DEFAULT_STYLE_VALUE">
          {{ control.placeholder }}
        </SelectItem>
        <SelectItem
          v-for="value in control.values"
          :key="value"
          :value="value"
        >
          {{ value }}
        </SelectItem>
      </SelectContent>
    </Select>

    <ColorPicker
      :model-value="textStyleValue('color') || '#000000'"
      :presets="COLOR_PRESETS"
      size="sm"
      @update:model-value="setTextColor"
    />
  </div>
</template>
