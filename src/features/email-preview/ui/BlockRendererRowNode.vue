<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { Atom, CellNode, RowNode } from '@/entities/block'
import { MButton, MColumn, MHr, MImg, MLink, MRow } from '@mysigmail/vue-email-components'
import { hasPositiveBorderRadius, resolveBorderRadiusStyle } from '@/entities/style'
import { useSelection } from '@/features/editor'
import { useInlineTextEditing } from '@/features/editor/components/tools/text/composables/use-inline-text-editing'
import { textOffsetAtCoords } from '@/features/editor/components/tools/text/inline-text-session'
import InlineTextEditor from '@/features/editor/components/tools/text/InlineTextEditor.vue'
import { resolveBorderStyle } from '@/features/email-preview/lib/resolve-border-style'
import { renderTextAtomHtml } from '@/features/email-preview/lib/text-box'
import EmailTextBox from '@/features/email-preview/ui/EmailTextBox.vue'

interface Props {
  blockId: string
  row: RowNode
  horizontalAlign?: CellNode['settings']['horizontalAlign']
}

const props = defineProps<Props>()

const { selectRow, selectCell, selectAtom } = useSelection()
const { editingAtomId, startEditing } = useInlineTextEditing()

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

function buttonStyle(atom: Extract<Atom, { type: 'button' }>): CSSProperties {
  const padding = tupleToCss(atom.spacing?.padding) || tupleToCss(atom.padding)

  return {
    backgroundColor: atom.backgroundColor,
    color: atom.color,
    fontSize: `${atom.fontSize}px`,
    borderRadius: resolveBorderRadiusStyle(atom.borderRadius),
    ...(padding ? { padding } : {}),
    display: 'inline-block',
    textDecoration: 'none',
    textAlign: 'center',
    cursor: 'pointer',
    ...resolveBorderStyle(atom.border),
  }
}

function imageStyle(
  atom: Extract<Atom, { type: 'image' }>,
  horizontalAlign?: CellNode['settings']['horizontalAlign'],
): CSSProperties {
  const align = horizontalAlign || 'left'

  return {
    display: 'block',
    maxWidth: '100%',
    width: atom.width ? `${atom.width}px` : undefined,
    height: atom.height ? `${atom.height}px` : undefined,
    borderRadius: resolveBorderRadiusStyle(atom.borderRadius),
    marginLeft: align === 'center' || align === 'right' ? 'auto' : '0',
    marginRight: align === 'center' ? 'auto' : '0',
    ...resolveBorderStyle(atom.border),
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

function normalizeGap(value: unknown) {
  const gap = Number(value)
  return Number.isFinite(gap) && gap > 0 ? gap : 0
}

function rowStyle(row: RowNode): CSSProperties {
  const s = row.settings
  const style: CSSProperties = {
    width: s.widthMode === 'hug' ? 'auto' : '100%',
    tableLayout: s.widthMode === 'hug' ? 'auto' : 'fixed',
    borderRadius: resolveBorderRadiusStyle(s.borderRadius),
    overflow: hasPositiveBorderRadius(s.borderRadius) ? 'hidden' : undefined,
    ...resolveBorderStyle(s.border),
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

  style['--e-row-gap'] = `${normalizeGap(s.gap)}px`

  if (s.widthMode === 'hug') {
    style.marginLeft
      = props.horizontalAlign === 'right' || props.horizontalAlign === 'center' ? 'auto' : '0'
    style.marginRight = props.horizontalAlign === 'center' ? 'auto' : '0'
  }

  return style
}

function rowAlign(row: RowNode) {
  return row.settings.widthMode === 'hug' ? undefined : 'center'
}

function nestedRowWrapperStyle(): CSSProperties {
  return {
    width: '100%',
    tableLayout: 'fixed',
  }
}

function nestedRowWrapperCellStyle(
  row: RowNode,
  horizontalAlign?: CellNode['settings']['horizontalAlign'],
): CSSProperties {
  const padding = tupleToCss(row.settings.spacing?.margin)
  return {
    ...(padding ? { padding } : {}),
    textAlign: horizontalAlign || 'left',
  }
}

function isRowHiddenOnMobile(row: RowNode) {
  return Boolean(row.settings.hiddenOnMobile)
}

function rowClass(row: RowNode) {
  return {
    'e-mobile-hidden': isRowHiddenOnMobile(row),
  }
}

function isCellHiddenOnMobile(cell: CellNode) {
  return Boolean(cell.settings.hiddenOnMobile)
}

function isRowCollapseOnMobile(row: RowNode) {
  return row.settings.collapseOnMobile !== false
}

function cellClass(cell: CellNode, row: RowNode) {
  const hiddenOnMobile = isRowHiddenOnMobile(row) || isCellHiddenOnMobile(cell)

  return {
    'e-col': true,
    'e-mobile-hidden': hiddenOnMobile,
    'e-col-mobile-collapse': isRowCollapseOnMobile(row),
  }
}

function shouldCollapseSpacer(cells: CellNode[], index: number, row: RowNode) {
  if (isRowHiddenOnMobile(row))
    return false

  const current = cells[index]
  const next = cells[index + 1]

  if (!current || !next)
    return false

  if (isCellHiddenOnMobile(current) || isCellHiddenOnMobile(next))
    return false

  return isRowCollapseOnMobile(row)
}

function shouldHideSpacerOnMobile(cells: CellNode[], index: number, row: RowNode) {
  if (isRowHiddenOnMobile(row))
    return true

  const current = cells[index]
  const next = cells[index + 1]

  if (!current || !next)
    return false

  return isCellHiddenOnMobile(current) || isCellHiddenOnMobile(next)
}

function spacerClass(cells: CellNode[], index: number, row: RowNode) {
  return {
    'e-col-gap': true,
    'e-col-gap-mobile-collapse': shouldCollapseSpacer(cells, index, row),
    'e-mobile-hidden': shouldHideSpacerOnMobile(cells, index, row),
  }
}

function shouldDistributeAutoWidth(items: CellNode[]) {
  return items.length > 1 && items.every(item => item.settings.width === undefined)
}

function itemStyle(item: CellNode, items: CellNode[], rawGap: number): CSSProperties {
  const s = item.settings
  const style: CSSProperties = { ...resolveBorderStyle(s.border) }

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

  const borderRadius = resolveBorderRadiusStyle(s.borderRadius)
  if (borderRadius) {
    style.borderRadius = borderRadius
    style.overflow = hasPositiveBorderRadius(s.borderRadius) ? 'hidden' : undefined
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

function emptyLinkedItemStyle(item: CellNode): CSSProperties {
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

function atomWrapperClass(atom: Atom) {
  return {
    'e-atom': true,
    'e-mobile-hidden': Boolean(atom.hiddenOnMobile),
  }
}

function selectRowNode(rowId: string) {
  selectRow(props.blockId, rowId)
}

function selectCellNode(rowId: string, cellId: string) {
  selectCell(props.blockId, rowId, cellId)
}

function selectAtomNode(rowId: string, cellId: string, atomId: string, event?: MouseEvent) {
  selectAtom(props.blockId, rowId, cellId, atomId)
  if (event?.currentTarget instanceof HTMLElement)
    event.currentTarget.focus()
}

function startTextEditing(rowId: string, cellId: string, atomId: string, event?: MouseEvent) {
  selectAtom(props.blockId, rowId, cellId, atomId)
  const pointerPosition = event
    ? {
        left: event.clientX,
        top: event.clientY,
        textOffset:
          event.currentTarget instanceof HTMLElement
            ? textOffsetAtCoords(event.currentTarget, { left: event.clientX, top: event.clientY })
            : undefined,
      }
    : undefined
  startEditing(atomId, pointerPosition)
}

function onTextAtomKeydown(event: KeyboardEvent, atomId: string) {
  if (event.key !== 'Enter' || editingAtomId.value === atomId)
    return

  event.preventDefault()
  startEditing(atomId)
}
</script>

<template>
  <MRow
    :align="rowAlign(row)"
    :class="rowClass(row)"
    :style="rowStyle(row)"
    :data-node-id="`row:${row.id}`"
    @click.stop="selectRowNode(row.id)"
  >
    <template
      v-for="(cell, cellIndex) in row.cells"
      :key="cell.id"
    >
      <MColumn
        :class="cellClass(cell, row)"
        :style="itemStyle(cell, row.cells, row.settings.gap)"
        :data-node-id="`cell:${cell.id}`"
        @click.stop="selectCellNode(row.id, cell.id)"
      >
        <div class="p-grid-gap">
          <MLink
            v-if="cell.settings.link && cell.children.length === 0"
            :href="cell.settings.link"
            :style="emptyLinkedItemStyle(cell)"
          >
            &nbsp;
          </MLink>

          <template
            v-for="child in cell.children"
            :key="child.id"
          >
            <MRow
              v-if="child.type === 'row'"
              :style="nestedRowWrapperStyle()"
            >
              <MColumn
                :align="cell.settings.horizontalAlign || 'left'"
                :style="nestedRowWrapperCellStyle(child, cell.settings.horizontalAlign)"
              >
                <BlockRendererRowNode
                  :block-id="blockId"
                  :row="child"
                  :horizontal-align="cell.settings.horizontalAlign"
                />
              </MColumn>
            </MRow>
            <EmailTextBox
              v-else-if="child.type === 'text'"
              :atom="child"
              :horizontal-align="cell.settings.horizontalAlign"
              preview
              :class="atomWrapperClass(child)"
              :data-node-id="`atom:${child.id}`"
              :tabindex="editingAtomId === child.id ? -1 : 0"
              @click.stop="selectAtomNode(row.id, cell.id, child.id, $event)"
              @keydown="onTextAtomKeydown($event, child.id)"
            >
              <InlineTextEditor
                v-if="editingAtomId === child.id"
                :atom-ref="{
                  kind: 'atom',
                  blockId,
                  rowId: row.id,
                  cellId: cell.id,
                  atomId: child.id,
                  atomType: 'text',
                }"
                :value="child.value"
              />
              <div
                v-else
                class="p-text-atom-content"
                data-selection-content
                @dblclick.stop.prevent="startTextEditing(row.id, cell.id, child.id, $event)"
                v-html="renderTextAtomHtml(child) || '&nbsp;'"
              />
            </EmailTextBox>

            <div
              v-else-if="child.type === 'button'"
              :class="atomWrapperClass(child)"
              :data-node-id="`atom:${child.id}`"
              :style="atomSpacingStyle(child, { includePadding: false })"
              @click.stop="selectAtomNode(row.id, cell.id, child.id)"
            >
              <MButton
                :href="child.link"
                :style="buttonStyle(child)"
                data-selection-owner
              >
                {{ child.text }}
              </MButton>
            </div>

            <div
              v-else-if="child.type === 'divider'"
              :class="atomWrapperClass(child)"
              :data-node-id="`atom:${child.id}`"
              :style="atomSpacingStyle(child)"
              @click.stop="selectAtomNode(row.id, cell.id, child.id)"
            >
              <MHr
                data-selection-owner
                :style="{
                  borderColor: child.color,
                  borderWidth: `${child.height}px`,
                  borderStyle: 'solid',
                  borderTop: 'none',
                  borderLeft: 'none',
                  borderRight: 'none',
                }"
              />
            </div>

            <div
              v-else-if="child.type === 'image'"
              :class="atomWrapperClass(child)"
              :data-node-id="`atom:${child.id}`"
              :style="atomSpacingStyle(child)"
              @click.stop="selectAtomNode(row.id, cell.id, child.id)"
            >
              <MLink
                :href="child.link"
                :style="imageLinkStyle()"
              >
                <MImg
                  :src="child.src"
                  :alt="child.alt"
                  :style="imageStyle(child, cell.settings.horizontalAlign)"
                  data-selection-owner
                />
              </MLink>
            </div>
          </template>
        </div>
      </MColumn>

      <MColumn
        v-if="shouldRenderSpacer(cellIndex, row.cells.length, row.settings.gap)"
        :class="spacerClass(row.cells, cellIndex, row)"
        :style="spacerStyle(row.settings.gap)"
        aria-hidden="true"
      >
        &nbsp;
      </MColumn>
    </template>
  </MRow>
</template>
