import type { Atom, BlockNode, CellNode, RowNode } from '@/entities/block'
import type { CanvasBlockInstance, GeneralTool } from '@/entities/template'
import { computed, ref } from 'vue'
import { BORDER_SIDES, normalizeEmailColor } from '@/entities/style'
import { splitCssDeclarations, splitCssProperty } from '@/shared/lib/css-style'
import { general, installed } from './state'

const RECENT_COLORS_KEY = 'card.color-picker.recent.v1'
const RECENT_COLORS_LIMIT = 12
const recentColors = ref<string[]>(readRecentColors())

export function normalizeRecentColors(values: unknown, next?: string) {
  const candidates = [next, ...(Array.isArray(values) ? values : [])]
  const result: string[] = []
  for (const candidate of candidates) {
    const color = normalizeEmailColor(candidate)
    if (color && !result.includes(color))
      result.push(color)
  }
  return result.slice(0, RECENT_COLORS_LIMIT)
}

function readRecentColors() {
  if (typeof window === 'undefined')
    return []
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(RECENT_COLORS_KEY) || '[]')
    return normalizeRecentColors(value)
  }
  catch {
    return []
  }
}

function addColor(output: Set<string>, value: unknown, allowTransparent = false) {
  const color = normalizeEmailColor(value, { allowTransparent })
  if (color && color !== 'transparent')
    output.add(color)
}

function collectBorderColors(output: Set<string>, border: BlockNode['settings']['border']) {
  BORDER_SIDES.forEach(side => addColor(output, border?.[side]?.color))
}

function collectTextColors(output: Set<string>, html: string) {
  for (const match of html.matchAll(/style=(['"])(.*?)\1/gi)) {
    for (const declaration of splitCssDeclarations(match[2] || '')) {
      const parsed = splitCssProperty(declaration)
      if (parsed && ['color', 'background-color'].includes(parsed.property.toLowerCase()))
        addColor(output, parsed.value)
    }
  }
}

function collectAtomColors(output: Set<string>, atom: Atom) {
  if (atom.type === 'text')
    collectTextColors(output, atom.value)
  if (atom.type === 'button') {
    addColor(output, atom.backgroundColor)
    addColor(output, atom.color)
  }
  if (atom.type === 'divider')
    addColor(output, atom.color)
  if ('border' in atom)
    collectBorderColors(output, atom.border)
}

function collectCellColors(output: Set<string>, cell: CellNode) {
  addColor(output, cell.settings.backgroundColor, true)
  collectBorderColors(output, cell.settings.border)
  cell.children.forEach(child =>
    child.type === 'row' ? collectRowColors(output, child) : collectAtomColors(output, child),
  )
}

function collectRowColors(output: Set<string>, row: RowNode) {
  addColor(output, row.settings.backgroundColor, true)
  collectBorderColors(output, row.settings.border)
  row.cells.forEach(cell => collectCellColors(output, cell))
}

function collectBlockColors(output: Set<string>, block: BlockNode) {
  addColor(output, block.settings.backgroundColor, true)
  collectBorderColors(output, block.settings.border)
  block.rows.forEach(row => collectRowColors(output, row))
}

export function collectDocumentColors(
  editorGeneral: GeneralTool,
  components: CanvasBlockInstance[],
) {
  const output = new Set<string>()
  addColor(output, editorGeneral.background.color)
  components.forEach(component => collectBlockColors(output, component.block))
  return [...output]
}

const documentColors = computed(() => collectDocumentColors(general, installed.value))

export function rememberColor(value: string) {
  const next = normalizeRecentColors(recentColors.value, value)
  if (next.length === 0)
    return
  recentColors.value = next
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.setItem(RECENT_COLORS_KEY, JSON.stringify(recentColors.value))
    }
    catch {
      // Color history is a best-effort local UI preference.
    }
  }
}

export function clearRecentColors() {
  recentColors.value = []
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(RECENT_COLORS_KEY)
    }
    catch {
      // Color history is a best-effort local UI preference.
    }
  }
}

export function useColorPalettes() {
  return { clearRecentColors, documentColors, recentColors, rememberColor }
}
