<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { Atom, BlockGrid, BlockItem } from '@/types/block'
import { MButton, MColumn, MHr, MImg, MLink, MRow } from '@mysigmail/vue-email-components'
import { useComponentsStore } from '@/store/components'

interface Props {
  blockId: string
  grid: BlockGrid
}

const props = defineProps<Props>()

const { selectGrid, selectItem, selectAtom } = useComponentsStore()

function tupleToCss(value?: [number, number, number, number]) {
  if (!value || value.length !== 4)
    return undefined

  return `${value[0]}px ${value[1]}px ${value[2]}px ${value[3]}px`
}

function atomSpacingStyle(atom: Atom, options: { includePadding?: boolean } = {}): CSSProperties {
  const style: CSSProperties = {}
  const spacing = atom.spacing

  const margin = tupleToCss(spacing?.margin)
  if (margin)
    style.margin = margin

  if (options.includePadding === false)
    return style

  const padding = tupleToCss(spacing?.padding)
  if (padding)
    style.padding = padding

  return style
}

function textAtomStyle(atom: Extract<Atom, { type: 'text' }>): CSSProperties {
  return {
    ...atomSpacingStyle(atom),
    ...(atom.color ? { color: atom.color } : {}),
  }
}

function buttonStyle(atom: Extract<Atom, { type: 'button' }>): CSSProperties {
  const padding = tupleToCss(atom.spacing?.padding) || tupleToCss(atom.padding)

  return {
    backgroundColor: atom.backgroundColor,
    color: atom.color,
    fontSize: `${atom.fontSize}px`,
    borderRadius: `${atom.borderRadius}px`,
    ...(padding ? { padding } : {}),
    display: 'inline-block',
    textDecoration: 'none',
    textAlign: 'center',
    cursor: 'pointer',
  }
}

function imageStyle(
  atom: Extract<Atom, { type: 'image' }>,
  horizontalAlign?: BlockItem['settings']['horizontalAlign'],
): CSSProperties {
  const align = horizontalAlign || 'left'

  return {
    display: 'block',
    maxWidth: '100%',
    width: atom.width ? `${atom.width}px` : undefined,
    height: atom.height ? `${atom.height}px` : undefined,
    borderRadius:
      atom.borderRadius !== undefined && Number.isFinite(atom.borderRadius)
        ? `${Math.max(0, atom.borderRadius)}px`
        : undefined,
    marginLeft: align === 'center' || align === 'right' ? 'auto' : '0',
    marginRight: align === 'center' ? 'auto' : '0',
  }
}

function imageLinkStyle(): CSSProperties {
  return {
    display: 'inline-block',
    lineHeight: '0',
    fontSize: '0',
    textDecoration: 'none',
  }
}

function menuItemLinkBaseStyle(gap: number, isLast: boolean): CSSProperties {
  return {
    display: 'inline-block',
    marginRight: isLast ? '0' : `${gap}px`,
  }
}

function menuTextLinkStyle(color: string, fontSize: number): CSSProperties {
  return {
    color,
    fontSize: `${fontSize}px`,
  }
}

function menuImageStyle(item: Extract<Atom, { type: 'menu' }>['items'][number]): CSSProperties {
  if (item.type !== 'image')
    return {}

  return {
    display: 'block',
    width: item.width ? `${item.width}px` : undefined,
    height: item.height ? `${item.height}px` : undefined,
    maxWidth: '100%',
  }
}

function menuAtomStyle(horizontalAlign?: BlockItem['settings']['horizontalAlign']): CSSProperties {
  return {
    textAlign: horizontalAlign || 'left',
  }
}

function normalizeGap(value: unknown) {
  const gap = Number(value)
  return Number.isFinite(gap) && gap > 0 ? gap : 0
}

function gridStyle(grid: BlockGrid): CSSProperties {
  const s = grid.settings
  const style: CSSProperties = {
    width: '100%',
    tableLayout: 'fixed',
  }

  if (s.backgroundColor && s.backgroundColor !== 'transparent')
    style.backgroundColor = s.backgroundColor

  if (s.spacing?.padding) {
    const [t, r, b, l] = s.spacing.padding
    style.padding = `${t}px ${r}px ${b}px ${l}px`
  }

  if (s.height)
    style.minHeight = `${s.height}px`

  if (s.backgroundImage?.url) {
    style.backgroundImage = `url(${s.backgroundImage.url})`
    style.backgroundRepeat = s.backgroundImage.repeat
    style.backgroundSize = s.backgroundImage.size
    style.backgroundPosition = s.backgroundImage.position
  }

  return style
}

function shouldDistributeAutoWidth(items: BlockItem[]) {
  return items.every(item => item.settings.width === undefined)
}

function itemStyle(item: BlockItem, items: BlockItem[], rawGap: number): CSSProperties {
  const s = item.settings
  const style: CSSProperties = {}

  if (s.backgroundColor && s.backgroundColor !== 'transparent')
    style.backgroundColor = s.backgroundColor

  if (s.spacing?.padding) {
    const [t, r, b, l] = s.spacing.padding
    style.padding = `${t}px ${r}px ${b}px ${l}px`
  }

  if (s.verticalAlign)
    style.verticalAlign = s.verticalAlign

  if (s.horizontalAlign)
    style.textAlign = s.horizontalAlign

  if (s.borderRadius !== undefined && Number.isFinite(s.borderRadius) && s.borderRadius >= 0) {
    style.borderRadius = `${s.borderRadius}px`
    style.overflow = s.borderRadius > 0 ? 'hidden' : undefined
  }

  if (s.width !== undefined) {
    style.width = `${s.width}%`
    style.maxWidth = `${s.width}%`
  }
  else if (shouldDistributeAutoWidth(items) && normalizeGap(rawGap) === 0) {
    const autoWidth = `${100 / Math.max(1, items.length)}%`
    style.width = autoWidth
    style.maxWidth = autoWidth
  }

  if (s.height)
    style.height = `${s.height}px`

  if (s.backgroundImage?.url) {
    style.backgroundImage = `url(${s.backgroundImage.url})`
    style.backgroundRepeat = s.backgroundImage.repeat
    style.backgroundSize = s.backgroundImage.size
    style.backgroundPosition = s.backgroundImage.position
  }

  return style
}

function shouldRenderSpacer(index: number, total: number, rawGap: number) {
  return normalizeGap(rawGap) > 0 && index < total - 1
}

function spacerStyle(rawGap: number): CSSProperties {
  const gap = normalizeGap(rawGap)

  return {
    width: `${gap}px`,
    minWidth: `${gap}px`,
    maxWidth: `${gap}px`,
    padding: '0',
    fontSize: '0',
    lineHeight: '0',
  }
}

function emptyLinkedItemStyle(item: BlockItem): CSSProperties {
  const itemHeight
    = item.settings.height && Number.isFinite(item.settings.height)
      ? Math.max(1, Number(item.settings.height))
      : 40

  return {
    display: 'block',
    width: '100%',
    minHeight: `${itemHeight}px`,
    lineHeight: `${itemHeight}px`,
    fontSize: '0',
    textDecoration: 'none',
  }
}

function selectGridNode(gridId: string) {
  selectGrid(props.blockId, gridId)
}

function selectItemNode(gridId: string, itemId: string) {
  selectItem(props.blockId, gridId, itemId)
}

function selectAtomNode(gridId: string, itemId: string, atomId: string) {
  selectAtom(props.blockId, gridId, itemId, atomId)
}
</script>

<template>
  <MRow
    :style="gridStyle(grid)"
    :data-node-id="`grid:${grid.id}`"
    @click.stop="selectGridNode(grid.id)"
  >
    <template
      v-for="(item, itemIndex) in grid.items"
      :key="item.id"
    >
      <MColumn
        :style="itemStyle(item, grid.items, grid.settings.gap)"
        :data-node-id="`item:${item.id}`"
        @click.stop="selectItemNode(grid.id, item.id)"
      >
        <div class="p-grid-gap">
          <MLink
            v-if="item.settings.link && item.atoms.length === 0 && item.grids.length === 0"
            :href="item.settings.link"
            :style="emptyLinkedItemStyle(item)"
          >
            &nbsp;
          </MLink>

          <template
            v-for="atom in item.atoms"
            :key="atom.id"
          >
            <div
              v-if="atom.type === 'text'"
              :data-node-id="`atom:${atom.id}`"
              :style="textAtomStyle(atom)"
              @click.stop="selectAtomNode(grid.id, item.id, atom.id)"
              v-html="atom.value || '&nbsp;'"
            />

            <div
              v-else-if="atom.type === 'button'"
              :data-node-id="`atom:${atom.id}`"
              :style="atomSpacingStyle(atom, { includePadding: false })"
              @click.stop="selectAtomNode(grid.id, item.id, atom.id)"
            >
              <MButton
                :href="atom.link"
                :style="buttonStyle(atom)"
              >
                {{ atom.text }}
              </MButton>
            </div>

            <div
              v-else-if="atom.type === 'divider'"
              :data-node-id="`atom:${atom.id}`"
              :style="atomSpacingStyle(atom)"
              @click.stop="selectAtomNode(grid.id, item.id, atom.id)"
            >
              <MHr
                :style="{
                  borderColor: atom.color,
                  borderWidth: `${atom.height}px`,
                  borderStyle: 'solid',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                }"
              />
            </div>

            <div
              v-else-if="atom.type === 'image'"
              :data-node-id="`atom:${atom.id}`"
              :style="atomSpacingStyle(atom)"
              @click.stop="selectAtomNode(grid.id, item.id, atom.id)"
            >
              <MLink
                :href="atom.link"
                :style="imageLinkStyle()"
              >
                <MImg
                  :src="atom.src"
                  :alt="atom.alt"
                  :style="imageStyle(atom, item.settings.horizontalAlign)"
                />
              </MLink>
            </div>

            <div
              v-else-if="atom.type === 'menu'"
              :data-node-id="`atom:${atom.id}`"
              :style="atomSpacingStyle(atom)"
              @click.stop="selectAtomNode(grid.id, item.id, atom.id)"
            >
              <div :style="menuAtomStyle(item.settings.horizontalAlign)">
                <MLink
                  v-for="(menuItem, menuIndex) in atom.items"
                  :key="`menu_${menuIndex}`"
                  :href="menuItem.link"
                  :style="
                    menuItemLinkBaseStyle(atom.gap ?? 10, atom.items.length === menuIndex + 1)
                  "
                >
                  <template v-if="menuItem.type === 'image'">
                    <MImg
                      :src="menuItem.url"
                      :alt="menuItem.alt"
                      :style="menuImageStyle(menuItem)"
                    />
                  </template>
                  <template v-else>
                    <span :style="menuTextLinkStyle(menuItem.color, menuItem.fontSize)">
                      {{ menuItem.text }}
                    </span>
                  </template>
                </MLink>
              </div>
            </div>
          </template>

          <BlockRendererGridNode
            v-for="nestedGrid in item.grids"
            :key="nestedGrid.id"
            :block-id="blockId"
            :grid="nestedGrid"
          />
        </div>
      </MColumn>

      <MColumn
        v-if="shouldRenderSpacer(itemIndex, grid.items.length, grid.settings.gap)"
        :style="spacerStyle(grid.settings.gap)"
        aria-hidden="true"
      >
        &nbsp;
      </MColumn>
    </template>
  </MRow>
</template>
