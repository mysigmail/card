<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { Atom, CellNode, RowNode } from '@/entities/block'
import { MButton, MColumn, MHr, MImg, MLink, MRow } from '@mysigmail/vue-email-components'

interface Props {
  row: RowNode
}

defineProps<Props>()

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
  horizontalAlign?: CellNode['settings']['horizontalAlign'],
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

function menuAtomStyle(horizontalAlign?: CellNode['settings']['horizontalAlign']): CSSProperties {
  return {
    textAlign: horizontalAlign || 'left',
  }
}

function normalizeGap(value: unknown) {
  const gap = Number(value)
  return Number.isFinite(gap) && gap > 0 ? gap : 0
}

function rowStyle(row: RowNode): CSSProperties {
  const s = row.settings
  const style: CSSProperties & Record<string, string> = {
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

  style['--e-row-gap'] = `${normalizeGap(s.gap)}px`

  return style
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
    'e-mobile-hidden': Boolean(atom.hiddenOnMobile),
  }
}
</script>

<template>
  <MRow
    :class="rowClass(row)"
    :style="rowStyle(row)"
  >
    <template
      v-for="(cell, cellIndex) in row.cells"
      :key="cell.id"
    >
      <MColumn
        :class="cellClass(cell, row)"
        :style="itemStyle(cell, row.cells, row.settings.gap)"
      >
        <MLink
          v-if="cell.settings.link && cell.atoms.length === 0 && cell.rows.length === 0"
          :href="cell.settings.link"
          :style="emptyLinkedItemStyle(cell)"
        >
          &nbsp;
        </MLink>

        <template
          v-for="atom in cell.atoms"
          :key="atom.id"
        >
          <div
            v-if="atom.type === 'text'"
            :class="atomWrapperClass(atom)"
            :style="textAtomStyle(atom)"
            v-html="atom.value || '&nbsp;'"
          />

          <div
            v-else-if="atom.type === 'button'"
            :class="atomWrapperClass(atom)"
            :style="atomSpacingStyle(atom, { includePadding: false })"
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
            :class="atomWrapperClass(atom)"
            :style="atomSpacingStyle(atom)"
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
            :class="atomWrapperClass(atom)"
            :style="atomSpacingStyle(atom)"
          >
            <MLink
              :href="atom.link"
              :style="imageLinkStyle()"
            >
              <MImg
                :src="atom.src"
                :alt="atom.alt"
                :style="imageStyle(atom, cell.settings.horizontalAlign)"
              />
            </MLink>
          </div>

          <div
            v-else-if="atom.type === 'menu'"
            :class="atomWrapperClass(atom)"
            :style="atomSpacingStyle(atom)"
          >
            <div :style="menuAtomStyle(cell.settings.horizontalAlign)">
              <MLink
                v-for="(menuItem, menuIndex) in atom.items"
                :key="`menu_${menuIndex}`"
                :href="menuItem.link"
                :style="menuItemLinkBaseStyle(atom.gap ?? 10, atom.items.length === menuIndex + 1)"
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

        <ExportBlockRendererRowNode
          v-for="nestedRow in cell.rows"
          :key="nestedRow.id"
          :row="nestedRow"
        />
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
