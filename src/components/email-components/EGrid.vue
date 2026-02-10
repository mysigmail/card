<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { AlignTool } from '@/types/editor'
import type { GridItem, GridItemContent } from '@/types/email-components/components'
import { computed } from 'vue'
import { useComponentsStore } from '@/store/components'

interface Props {
  id: string
  group: string
  items: GridItem[]
  align?: AlignTool['value']
  gap?: string | number
  width?: string | number
}

const props = defineProps<Props>()

const { editableId, editableToolName } = useComponentsStore()
const isEditable = computed(
  () => editableId.value === props.id && editableToolName.value === props.group,
)

const containerStyle = computed(() => {
  const value = props.width
  if (value === undefined || value === null || value === '')
    return undefined

  return {
    width: typeof value === 'number' ? `${value}px` : value,
  }
})

function isVisible(item: GridItem) {
  return item.show !== false
}

function contentKey(content: GridItemContent, index: number) {
  return `${content.type}_${index}`
}

const visibleItems = computed(() => props.items.filter(isVisible))

function getColumnWidth() {
  return `${100 / Math.max(1, visibleItems.value.length)}%`
}

const gridGap = computed(() => {
  if (props.gap === undefined || props.gap === null || props.gap === '')
    return undefined

  if (typeof props.gap === 'number')
    return `${Math.max(0, props.gap)}px`

  const trimmed = props.gap.trim()
  if (!trimmed)
    return undefined

  const numeric = Number(trimmed)
  if (Number.isFinite(numeric))
    return `${Math.max(0, numeric)}px`

  return trimmed
})

const halfGap = computed(() => {
  if (!gridGap.value)
    return undefined

  return `calc(${gridGap.value} / 2)`
})

function getColumnStyle(item: GridItem) {
  return {
    width: getColumnWidth(),
    verticalAlign: item.verticalAlign || 'top',
  } satisfies CSSProperties
}

function getContentStyle(index: number) {
  const isFirst = index === 0
  const isLast = index === visibleItems.value.length - 1
  const normalizedHalfGap = halfGap.value || '0px'
  const normalizedGap = gridGap.value || '0px'

  return {
    'boxSizing': 'border-box',
    '--e-grid-gap-overlay-offset': isLast ? '0px' : normalizedHalfGap,
    '--e-grid-gap-overlay-width': isLast ? '0px' : normalizedGap,
    'paddingLeft': isFirst ? undefined : halfGap.value,
    'paddingRight': isLast ? undefined : halfGap.value,
  } satisfies CSSProperties
  & Record<'--e-grid-gap-overlay-offset' | '--e-grid-gap-overlay-width', string>
}
</script>

<template>
  <MColumn
    class="p-hover-tools"
    :align="align"
    :style="containerStyle"
    :class="{
      'p-edit-tool': isEditable,
    }"
  >
    <MRow>
      <MColumn
        v-for="(item, index) in visibleItems"
        :key="index"
        :style="getColumnStyle(item)"
        :align="item.align || align"
      >
        <div
          class="p-grid-gap"
          :class="{
            'p-grid-gap--show': isEditable && !!gridGap,
          }"
          :style="getContentStyle(index)"
        >
          <template
            v-for="(content, contentIndex) in item.contents"
            :key="contentKey(content, contentIndex)"
          >
            <MLink
              v-if="content.type === 'image'"
              :href="content.link"
            >
              <MImg v-bind="content.attrs" />
            </MLink>

            <MLink
              v-if="content.type === 'text' && content.link"
              :href="content.link"
            >
              <div
                v-bind="content.attrs"
                v-html="content.value"
              />
            </MLink>

            <div
              v-if="content.type === 'text' && !content.link"
              v-bind="content.attrs"
              v-html="content.value"
            />

            <MButton
              v-if="content.type === 'button'"
              v-bind="content.attrs"
            >
              {{ content.text }}
            </MButton>

            <MRow
              v-if="content.type === 'menu'"
              width="auto"
              :align="item.align || align"
            >
              <MColumn
                v-for="(menuItem, menuIndex) in content.items"
                :key="`menu_${menuIndex}`"
                :style="{ paddingRight: content.items.length === menuIndex + 1 ? '0' : '10px' }"
              >
                <MLink
                  :href="menuItem.link"
                  :style="{
                    color: menuItem.color,
                    fontSize: `${menuItem.fontSize}px`,
                  }"
                >
                  {{ menuItem.text }}
                </MLink>
              </MColumn>
            </MRow>

            <MRow
              v-if="content.type === 'social'"
              width="auto"
              :align="item.align || align"
            >
              <MColumn
                v-for="(socialItem, socialIndex) in content.items"
                :key="`social_${socialIndex}`"
                :style="{ paddingRight: content.items.length === socialIndex + 1 ? '0' : '18px' }"
              >
                <MLink :href="socialItem.link">
                  <MImg
                    :src="socialItem.image.src"
                    :style="{
                      width: socialItem.image.width ? `${socialItem.image.width}px` : undefined,
                      height: socialItem.image.height ? `${socialItem.image.height}px` : undefined,
                    }"
                    :alt="socialItem.image.alt"
                  />
                </MLink>
              </MColumn>
            </MRow>
          </template>
        </div>
      </MColumn>
    </MRow>
  </MColumn>
</template>
