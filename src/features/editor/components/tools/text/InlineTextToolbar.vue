<script setup lang="ts">
import type { Editor } from '@tiptap/vue-3'
import type { InlineEditorProfile } from './text-editor-core'
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
import UilArrowsHAlt from '~icons/uil/arrows-h-alt'
import UilArrowsVAlt from '~icons/uil/arrows-v-alt'
import UilText from '~icons/uil/text'
import UilTextFields from '~icons/uil/text-fields'
import { useCanvas, useColorPalettes } from '@/features/editor/model'
import { Button } from '@/shared/ui/button'
import { ColorPicker } from '@/shared/ui/color-picker'
import { Input } from '@/shared/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Separator } from '@/shared/ui/separator'
import { Toggle } from '@/shared/ui/toggle'
import { useInlineToolbarPosition } from './composables/use-inline-toolbar-position'
import ScrubbableNumberField from './ScrubbableNumberField.vue'
import { INLINE_TEXT_FONT_FAMILIES } from './text-editor-core'

interface Props {
  atomId: string
  editor: Editor
  revision: number
  profile: InlineEditorProfile
}

defineOptions({ inheritAttrs: false })

const props = defineProps<Props>()
const toolbar = ref<HTMLElement>()
const { toolbarPosition } = useInlineToolbarPosition(props.editor, toolbar)
const { general } = useCanvas()
const { documentColors, recentColors, rememberColor } = useColorPalettes()

const DEFAULT_STYLE_VALUE = '__default__'
const MIXED_STYLE_VALUE = '__mixed__'
const FONT_WEIGHTS = ['400', '500', '600', '700', '800', '900']
const COLOR_PRESETS = ['#F56C6C', '#E6A23C', '#67C23A', '#396BDD', '#000000', '#FFFFFF']

function textStyleValue(name: string) {
  void props.revision
  return props.editor.getAttributes('textStyle')[name] ?? ''
}

type TextStyleName = 'fontFamily' | 'fontSize' | 'fontWeight' | 'lineHeight' | 'letterSpacing'
type SelectTextStyleName = Extract<TextStyleName, 'fontFamily' | 'fontWeight'>
type NumericTextStyleName = Extract<TextStyleName, 'fontSize' | 'lineHeight' | 'letterSpacing'>

function selectedTextStyleValue(name: TextStyleName) {
  void props.revision
  const { from, to, empty } = props.editor.state.selection

  if (empty) {
    const value = textStyleValue(name)
    if (!value && name === 'fontWeight' && props.editor.isActive('bold'))
      return '700'
    return String(value)
  }

  const values = new Set<string>()
  props.editor.state.doc.nodesBetween(from, to, (node) => {
    if (!node.isText)
      return

    const textStyle = node.marks.find(mark => mark.type.name === 'textStyle')
    const value = textStyle?.attrs[name]
    if (value) {
      values.add(String(value))
      return
    }

    const isBold = name === 'fontWeight' && node.marks.some(mark => mark.type.name === 'bold')
    values.add(isBold ? '700' : '')
  })

  if (values.size > 1)
    return MIXED_STYLE_VALUE

  return values.values().next().value ?? ''
}

function selectStyleValue(name: SelectTextStyleName) {
  return selectedTextStyleValue(name) || DEFAULT_STYLE_VALUE
}

function defaultStyleValue(name: SelectTextStyleName) {
  if (name === 'fontFamily')
    return general.font || 'Arial'
  return '400'
}

function formatStyleValue(name: SelectTextStyleName, value: string) {
  if (value === MIXED_STYLE_VALUE)
    return 'Mixed'

  const effectiveValue = value || defaultStyleValue(name)
  if (name === 'fontFamily') {
    return (
      INLINE_TEXT_FONT_FAMILIES.find(
        font => font.value === effectiveValue || font.label === effectiveValue,
      )?.label ?? effectiveValue
    )
  }

  return effectiveValue
}

function displayedStyleValue(name: SelectTextStyleName) {
  return formatStyleValue(name, selectedTextStyleValue(name))
}

function defaultStyleLabel(name: SelectTextStyleName) {
  return formatStyleValue(name, defaultStyleValue(name))
}

const fontFamilyOptions = computed(() => {
  const inheritedFont = defaultStyleLabel('fontFamily')
  return INLINE_TEXT_FONT_FAMILIES.filter((font) => {
    return Boolean(font.value) && font.label !== inheritedFont && font.value !== general.font
  })
})

function numericStyleValue(name: NumericTextStyleName, fallback?: number) {
  const value = selectedTextStyleValue(name)
  if (value === MIXED_STYLE_VALUE)
    return 'mixed' as const
  if (!value)
    return fallback

  const number = Number.parseFloat(value)
  return Number.isFinite(number) ? number : fallback
}

function setNumericStyle(name: NumericTextStyleName, value: number | undefined) {
  if (value === undefined) {
    setTextStyle(name, DEFAULT_STYLE_VALUE)
    return
  }

  setTextStyle(name, name === 'lineHeight' ? String(value) : `${value}px`)
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
  const chain = props.editor.chain().focus().unsetAllMarks()
  if (props.profile === 'text')
    chain.unsetTextAlign().clearNodes()
  chain.run()
}

function setTextColor(color: string) {
  props.editor.chain().setColor(color).run()
}

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
      v-if="profile === 'text'"
      orientation="vertical"
      class="mx-0.5 h-5"
    />

    <template v-if="profile === 'text'">
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
    </template>

    <Separator
      v-if="profile === 'text'"
      orientation="vertical"
      class="mx-0.5 h-5"
    />

    <template v-if="profile === 'text'">
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
    </template>

    <Toggle
      v-for="item in [
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

    <Popover v-if="profile === 'text'">
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
        class="w-[120px] gap-1.5 px-2 text-xs"
        aria-label="Font family"
      >
        <UilText class="size-4 text-muted-foreground" />
        <SelectValue>
          {{ displayedStyleValue('fontFamily') }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        :body-lock="false"
        :disable-outside-pointer-events="false"
      >
        <SelectItem
          v-if="selectStyleValue('fontFamily') === MIXED_STYLE_VALUE"
          :value="MIXED_STYLE_VALUE"
          disabled
        >
          Mixed
        </SelectItem>
        <SelectItem :value="DEFAULT_STYLE_VALUE">
          {{ defaultStyleLabel('fontFamily') }}
        </SelectItem>
        <SelectItem
          v-for="font in fontFamilyOptions"
          :key="font.label"
          :value="font.value"
        >
          {{ font.label }}
        </SelectItem>
      </SelectContent>
    </Select>

    <ScrubbableNumberField
      class="w-[76px]"
      label="Font size"
      :model-value="numericStyleValue('fontSize', 16)"
      :default-value="16"
      :min="1"
      :max="250"
      :step="1"
      :precision="0"
      :pixels-per-step="2"
      @update:model-value="setNumericStyle('fontSize', $event)"
    >
      <template #prefix>
        <UilTextFields />
      </template>
    </ScrubbableNumberField>

    <Select
      :model-value="selectStyleValue('fontWeight')"
      @update:model-value="setTextStyle('fontWeight', stringValue($event))"
    >
      <SelectTrigger
        size="sm"
        class="w-[92px] gap-1.5 px-2 text-xs"
        aria-label="Font weight"
      >
        <Bold class="size-4 text-muted-foreground" />
        <SelectValue>
          {{ displayedStyleValue('fontWeight') }}
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        :body-lock="false"
        :disable-outside-pointer-events="false"
      >
        <SelectItem
          v-if="selectStyleValue('fontWeight') === MIXED_STYLE_VALUE"
          :value="MIXED_STYLE_VALUE"
          disabled
        >
          Mixed
        </SelectItem>
        <SelectItem :value="DEFAULT_STYLE_VALUE">
          {{ defaultStyleLabel('fontWeight') }}
        </SelectItem>
        <SelectItem
          v-for="value in FONT_WEIGHTS.filter((value) => value !== defaultStyleValue('fontWeight'))"
          :key="value"
          :value="value"
        >
          {{ value }}
        </SelectItem>
      </SelectContent>
    </Select>

    <ScrubbableNumberField
      class="w-[82px]"
      label="Line height"
      :model-value="numericStyleValue('lineHeight')"
      :default-value="1.2"
      :min="0.5"
      :max="10"
      :step="0.1"
      :precision="2"
      :pixels-per-step="4"
      @update:model-value="setNumericStyle('lineHeight', $event)"
    >
      <template #prefix>
        <UilArrowsVAlt />
      </template>
    </ScrubbableNumberField>

    <ScrubbableNumberField
      class="w-[82px]"
      label="Letter spacing"
      :model-value="numericStyleValue('letterSpacing')"
      :default-value="0"
      :min="-50"
      :max="100"
      :step="0.1"
      :precision="2"
      :pixels-per-step="4"
      @update:model-value="setNumericStyle('letterSpacing', $event)"
    >
      <template #prefix>
        <UilArrowsHAlt />
      </template>
    </ScrubbableNumberField>

    <ColorPicker
      :model-value="textStyleValue('color') || '#000000'"
      :presets="COLOR_PRESETS"
      :recent-colors="recentColors"
      :document-colors="documentColors"
      size="sm"
      @commit="rememberColor"
      @update:model-value="setTextColor"
    />
  </div>
</template>
