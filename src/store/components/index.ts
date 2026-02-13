import type { Atom, AtomType, BlockNode, CellNode, RowNode } from '@/types/block'
import type {
  BackgroundImageTool,
  BlockPreset,
  CanvasBlockInstance,
  GeneralTool,
  ImageTool,
  SpacingTool,
  Tool,
} from '@/types/editor'
import type { ComponentList } from '@/types/email-components/components'
import type {
  TemplateExportV1,
  TemplateImportMode,
  TemplateValidationIssue,
} from '@/types/template'
import { nanoid } from 'nanoid'
import { computed, reactive, ref, shallowRef, watch } from 'vue'
import {
  createAtom,
  createBlockNode,
  createCellNode,
  createRowNode,
} from '@/components/email-components/block-factory'
import { content } from '@/components/email-components/catalog/content'
import { header } from '@/components/email-components/catalog/header'
import { menu } from '@/components/email-components/catalog/menu'
import {
  createRuntimeComponents,
  createTemplateExportPayload,
  parseTemplateExportJson,
  parseTemplateExportPayload,
} from '@/store/components/template-io'
import { TEMPLATE_LOCAL_STORAGE_KEY } from '@/types/template'
import { clone } from '@/utils'

const list = shallowRef<ComponentList[]>([
  { name: 'Menu', components: menu },
  { name: 'Header', components: header },
  { name: 'Content', components: content },
  { name: 'Feature', components: [] },
  { name: 'Call to Action', components: [] },
  { name: 'E-Commerce', components: [] },
  { name: 'Footer', components: [] },
])

const installed = ref<CanvasBlockInstance[]>([])
const editableId = ref<string>()
const isDragging = ref(false)
const templateImportIssues = ref<TemplateValidationIssue[]>([])

export type BlockSelectionLevel = 'block' | 'row' | 'cell' | 'atom'
export type SidebarTab = 'components' | 'tree'
const selectedBlockId = ref<string>()
const selectedRowId = ref<string>()
const selectedCellId = ref<string>()
const selectedAtomId = ref<string>()
const selectionLevel = ref<BlockSelectionLevel>()
const sidebarActiveTab = ref<SidebarTab>('components')
const treeScrollTarget = ref<string>()
const treeScrollRequestId = ref(0)

let templatePersistenceInitialized = false
let ignoreTemplatePersist = false

const general = reactive<GeneralTool>({
  padding: [24, 0, 24, 0],
  background: {
    color: '#F5F5F5',
    image: '',
    repeat: 'no-repeat',
    size: 'cover',
    position: 'center',
  },
  font: 'Arial',
  previewText: '',
})

function isCanvasBlockInstance(
  canvasBlock: CanvasBlockInstance,
): canvasBlock is CanvasBlockInstance {
  return canvasBlock.version === 2
}

const editableIndex = computed(() => {
  if (!installed.value?.length)
    return -1

  return installed.value.findIndex(i => i.id === editableId.value)
})

function resetSelection() {
  editableId.value = undefined
  resetBlockSelection()
}

function resetBlockSelection() {
  selectedBlockId.value = undefined
  selectedRowId.value = undefined
  selectedCellId.value = undefined
  selectedAtomId.value = undefined
  selectionLevel.value = undefined
}

function requestTreeScroll(target: string) {
  treeScrollTarget.value = target
  treeScrollRequestId.value += 1
}

function openTreeAndScroll(target: string) {
  sidebarActiveTab.value = 'tree'
  requestTreeScroll(target)
}

function applyImportedTemplate(
  payload: TemplateExportV1,
  mode: TemplateImportMode,
  options?: {
    applyGeneralInAppend?: boolean
  },
) {
  const components = createRuntimeComponents(payload.canvas.components)

  if (mode === 'replace') {
    installed.value = components
  }
  else {
    installed.value.push(...components)
  }

  if (mode === 'replace' || options?.applyGeneralInAppend) {
    Object.assign(general, clone(payload.editor.general))
  }

  resetSelection()
}

function exportTemplate(title?: string) {
  return createTemplateExportPayload({
    general,
    installed: installed.value,
    title,
  })
}

function exportTemplateJson(title?: string) {
  return JSON.stringify(exportTemplate(title), null, 2)
}

function persistTemplateToLocalStorage() {
  if (typeof window === 'undefined' || ignoreTemplatePersist)
    return

  try {
    window.localStorage.setItem(TEMPLATE_LOCAL_STORAGE_KEY, exportTemplateJson())
  }
  catch {
    // Ignore storage write errors (private mode / quota exceeded)
  }
}

function importTemplate(
  payload: unknown,
  mode: TemplateImportMode = 'replace',
  options?: {
    applyGeneralInAppend?: boolean
  },
) {
  const result = parseTemplateExportPayload(payload)
  templateImportIssues.value = result.issues

  if (!result.payload) {
    return {
      ok: false as const,
      issues: result.issues,
    }
  }

  ignoreTemplatePersist = true
  applyImportedTemplate(result.payload, mode, options)
  ignoreTemplatePersist = false

  persistTemplateToLocalStorage()

  return {
    ok: true as const,
    issues: [] as TemplateValidationIssue[],
  }
}

function importTemplateFromJson(
  raw: string,
  mode: TemplateImportMode = 'replace',
  options?: {
    applyGeneralInAppend?: boolean
  },
) {
  const result = parseTemplateExportJson(raw)
  templateImportIssues.value = result.issues

  if (!result.payload) {
    return {
      ok: false as const,
      issues: result.issues,
    }
  }

  ignoreTemplatePersist = true
  applyImportedTemplate(result.payload, mode, options)
  ignoreTemplatePersist = false

  persistTemplateToLocalStorage()

  return {
    ok: true as const,
    issues: [] as TemplateValidationIssue[],
  }
}

function hydrateTemplateFromLocalStorage() {
  if (typeof window === 'undefined') {
    return {
      ok: false as const,
      issues: [] as TemplateValidationIssue[],
    }
  }

  const raw = window.localStorage.getItem(TEMPLATE_LOCAL_STORAGE_KEY)

  if (!raw) {
    return {
      ok: true as const,
      issues: [] as TemplateValidationIssue[],
    }
  }

  const result = parseTemplateExportJson(raw)
  templateImportIssues.value = result.issues

  if (!result.payload) {
    return {
      ok: false as const,
      issues: result.issues,
    }
  }

  ignoreTemplatePersist = true
  applyImportedTemplate(result.payload, 'replace')
  ignoreTemplatePersist = false

  return {
    ok: true as const,
    issues: [] as TemplateValidationIssue[],
  }
}

function initTemplatePersistence() {
  if (templatePersistenceInitialized || typeof window === 'undefined')
    return

  templatePersistenceInitialized = true

  watch(
    installed,
    () => {
      persistTemplateToLocalStorage()
    },
    { deep: true },
  )

  watch(
    general,
    () => {
      persistTemplateToLocalStorage()
    },
    { deep: true },
  )
}

// Methods
function addComponent(component: BlockPreset, index?: number) {
  const clonedBlock = clone(component.block)
  regenerateBlockNodeIds(clonedBlock)

  const cloned: CanvasBlockInstance = {
    id: nanoid(8),
    version: 2,
    block: clonedBlock,
  }

  if (index !== undefined)
    installed.value.splice(index, 0, cloned)
  else installed.value.push(cloned)
}

function regenerateCellNodeIds(cell: CellNode) {
  cell.id = nanoid(8)
  cell.atoms.forEach((atom) => {
    atom.id = nanoid(8)
  })
  cell.rows.forEach((row) => {
    regenerateRowNodeIds(row)
  })
}

function regenerateRowNodeIds(row: RowNode) {
  row.id = nanoid(8)
  row.cells.forEach((cell) => {
    regenerateCellNodeIds(cell)
  })
}

function regenerateBlockNodeIds(block: BlockNode) {
  block.id = nanoid(8)
  block.rows.forEach((row) => {
    regenerateRowNodeIds(row)
  })
}

function findRowInRows(rows: RowNode[], rowId: string): RowNode | undefined {
  for (const row of rows) {
    if (row.id === rowId)
      return row

    for (const cell of row.cells) {
      const nested = findRowInRows(cell.rows, rowId)
      if (nested)
        return nested
    }
  }

  return undefined
}

function findRowContainerInRows(
  rows: RowNode[],
  rowId: string,
  isTopLevel = false,
): { container: RowNode[], index: number, isTopLevel: boolean } | undefined {
  for (const [index, row] of rows.entries()) {
    if (row.id === rowId) {
      return {
        container: rows,
        index,
        isTopLevel,
      }
    }

    for (const cell of row.cells) {
      const nested = findRowContainerInRows(cell.rows, rowId, false)
      if (nested)
        return nested
    }
  }

  return undefined
}

function findCellInRows(rows: RowNode[], cellId: string): CellNode | undefined {
  for (const row of rows) {
    const found = row.cells.find(i => i.id === cellId)
    if (found)
      return found

    for (const cell of row.cells) {
      const nested = findCellInRows(cell.rows, cellId)
      if (nested)
        return nested
    }
  }

  return undefined
}

function findCanvasBlockInstance(blockId: string): CanvasBlockInstance | undefined {
  return installed.value.find(
    (i): i is CanvasBlockInstance => isCanvasBlockInstance(i) && i.block.id === blockId,
  )
}

function insertBlockToCanvas(label?: string, index?: number) {
  const block = createBlockNode(label)
  const blockComponent: CanvasBlockInstance = {
    id: nanoid(8),
    version: 2,
    block,
  }

  if (index !== undefined)
    installed.value.splice(index, 0, blockComponent)
  else installed.value.push(blockComponent)

  return blockComponent
}

function renameBlock(blockId: string, label: string) {
  const bc = findCanvasBlockInstance(blockId)
  if (!bc)
    return

  const nextLabel = label.trim()
  if (!nextLabel)
    return

  bc.block.label = nextLabel

  return bc.block
}

function insertRowToBlock(blockId: string, insertIndex?: number) {
  const bc = findCanvasBlockInstance(blockId)
  if (!bc)
    return

  const row = createRowNode()
  if (insertIndex !== undefined)
    bc.block.rows.splice(insertIndex, 0, row)
  else bc.block.rows.push(row)

  return row
}

function removeRow(blockId: string, rowId: string) {
  const bc = findCanvasBlockInstance(blockId)
  if (!bc)
    return

  const target = findRowContainerInRows(bc.block.rows, rowId, true)
  if (!target)
    return

  if (target.isTopLevel && target.container.length <= 1)
    return

  target.container.splice(target.index, 1)
  if (selectedRowId.value === rowId)
    selectBlock(blockId)
}

function insertRowToCell(blockId: string, rowId: string, cellId: string, insertIndex?: number) {
  const bc = findCanvasBlockInstance(blockId)
  if (!bc)
    return

  const parentRow = findRowInRows(bc.block.rows, rowId)
  if (!parentRow)
    return

  const cell = parentRow.cells.find(i => i.id === cellId)
  if (!cell)
    return

  const nestedRow = createRowNode()
  if (insertIndex !== undefined)
    cell.rows.splice(insertIndex, 0, nestedRow)
  else cell.rows.push(nestedRow)

  return nestedRow
}

function insertCellToRow(blockId: string, rowId: string, insertIndex?: number) {
  const bc = findCanvasBlockInstance(blockId)
  if (!bc)
    return

  const row = findRowInRows(bc.block.rows, rowId)
  if (!row)
    return

  const cell = createCellNode()
  if (insertIndex !== undefined)
    row.cells.splice(insertIndex, 0, cell)
  else row.cells.push(cell)

  return cell
}

function removeCell(blockId: string, rowId: string, cellId: string) {
  const bc = findCanvasBlockInstance(blockId)
  if (!bc)
    return

  const row = findRowInRows(bc.block.rows, rowId)
  if (!row || row.cells.length <= 1)
    return

  const idx = row.cells.findIndex(i => i.id === cellId)
  if (idx !== -1) {
    row.cells.splice(idx, 1)
    if (selectedCellId.value === cellId)
      selectRow(blockId, rowId)
  }
}

function insertAtomToCell(
  blockId: string,
  rowId: string,
  cellId: string,
  atomType: AtomType,
  insertIndex?: number,
) {
  const bc = findCanvasBlockInstance(blockId)
  if (!bc)
    return

  const row = findRowInRows(bc.block.rows, rowId)
  if (!row)
    return

  const cell = row.cells.find(i => i.id === cellId)
  if (!cell)
    return

  const atom = createAtom(atomType)
  if (insertIndex !== undefined)
    cell.atoms.splice(insertIndex, 0, atom)
  else cell.atoms.push(atom)

  return atom
}

function removeAtom(blockId: string, rowId: string, cellId: string, atomId: string) {
  const bc = findCanvasBlockInstance(blockId)
  if (!bc)
    return

  const row = findRowInRows(bc.block.rows, rowId)
  if (!row)
    return

  const cell = row.cells.find(i => i.id === cellId)
  if (!cell)
    return

  const idx = cell.atoms.findIndex(a => a.id === atomId)
  if (idx !== -1) {
    cell.atoms.splice(idx, 1)
    if (selectedAtomId.value === atomId)
      selectCell(blockId, rowId, cellId)
  }
}

function moveAtomWithinCell(
  blockId: string,
  rowId: string,
  cellId: string,
  oldIndex: number,
  newIndex: number,
) {
  const bc = findCanvasBlockInstance(blockId)
  if (!bc)
    return

  const row = findRowInRows(bc.block.rows, rowId)
  if (!row)
    return

  const cell = row.cells.find(i => i.id === cellId)
  if (!cell)
    return

  const [atom] = cell.atoms.splice(oldIndex, 1)
  if (atom)
    cell.atoms.splice(newIndex, 0, atom)
}

function selectBlock(blockId: string, options?: { syncTree?: boolean }) {
  const bc = findCanvasBlockInstance(blockId)
  if (!bc)
    return

  editableId.value = bc.id

  selectedBlockId.value = blockId
  selectedRowId.value = undefined
  selectedCellId.value = undefined
  selectedAtomId.value = undefined
  selectionLevel.value = 'block'

  if (options?.syncTree !== false)
    openTreeAndScroll(`block:${blockId}`)
}

function selectRow(blockId: string, rowId: string, options?: { syncTree?: boolean }) {
  selectBlock(blockId, { syncTree: false })
  selectedRowId.value = rowId
  selectedCellId.value = undefined
  selectedAtomId.value = undefined
  selectionLevel.value = 'row'

  if (options?.syncTree !== false)
    openTreeAndScroll(`row:${rowId}`)
}

function selectCell(
  blockId: string,
  rowId: string,
  cellId: string,
  options?: { syncTree?: boolean },
) {
  selectRow(blockId, rowId, { syncTree: false })
  selectedCellId.value = cellId
  selectedAtomId.value = undefined
  selectionLevel.value = 'cell'

  if (options?.syncTree !== false)
    openTreeAndScroll(`cell:${cellId}`)
}

function selectAtom(
  blockId: string,
  rowId: string,
  cellId: string,
  atomId: string,
  options?: { syncTree?: boolean },
) {
  selectCell(blockId, rowId, cellId, { syncTree: false })
  selectedAtomId.value = atomId
  selectionLevel.value = 'atom'

  if (options?.syncTree !== false)
    openTreeAndScroll(`atom:${atomId}`)
}

const selectedBlock = computed((): BlockNode | undefined => {
  if (!selectedBlockId.value)
    return undefined
  return findCanvasBlockInstance(selectedBlockId.value)?.block
})

const selectedRow = computed((): RowNode | undefined => {
  if (!selectedBlock.value || !selectedRowId.value)
    return undefined
  return findRowInRows(selectedBlock.value.rows, selectedRowId.value)
})

const selectedCell = computed((): CellNode | undefined => {
  if (!selectedRow.value || !selectedCellId.value)
    return undefined
  return selectedRow.value.cells.find(i => i.id === selectedCellId.value)
})

const selectedAtom = computed((): Atom | undefined => {
  if (!selectedCell.value || !selectedAtomId.value)
    return undefined
  return selectedCell.value.atoms.find(a => a.id === selectedAtomId.value)
})

const installedBlocks = computed(() => {
  return installed.value.filter(isCanvasBlockInstance)
})

function duplicateComponent(installedIndex: number) {
  const canvasBlock = installed.value[installedIndex]
  if (!canvasBlock || !isCanvasBlockInstance(canvasBlock))
    return

  const clonedBlock = clone(canvasBlock.block)
  regenerateBlockNodeIds(clonedBlock)

  const cloned: CanvasBlockInstance = {
    id: nanoid(8),
    version: 2,
    block: clonedBlock,
  }
  installed.value.splice(installedIndex + 1, 0, cloned)
}

function duplicateComponentById(componentId: string) {
  const index = installed.value.findIndex(canvasBlock => canvasBlock.id === componentId)
  if (index === -1)
    return

  duplicateComponent(index)
}

function moveComponent(oldIndex: number, newIndex: number) {
  const component = installed.value[oldIndex]

  if (!component)
    return

  installed.value.splice(oldIndex, 1)
  installed.value.splice(newIndex, 0, component)
}

function removeComponent(index: number) {
  const removed = installed.value[index]

  if (!removed)
    return

  installed.value.splice(index, 1)

  if (editableId.value === removed.id)
    resetSelection()
}

function removeComponentById(componentId: string) {
  const index = installed.value.findIndex(canvasBlock => canvasBlock.id === componentId)
  if (index === -1)
    return

  removeComponent(index)
}

function clearCanvas() {
  installed.value = []
  templateImportIssues.value = []
  resetSelection()
}

const DEFAULT_BACKGROUND_IMAGE: BackgroundImageTool['value'] = {
  url: '',
  repeat: 'no-repeat',
  size: 'cover',
  position: 'center',
}

const DEFAULT_MENU_TEXT_ITEM = {
  type: 'text' as const,
  text: 'Item',
  link: 'https://example',
  color: '#000000',
  fontSize: 16,
} as const
const DEFAULT_MENU_IMAGE_ITEM = {
  type: 'image' as const,
  name: 'Icon',
  link: 'https://example',
  url: '/img/facebook-black.png',
  width: 16,
  height: 16,
  alt: 'Icon',
} as const
const DEFAULT_MENU_ATOM_GAP = 10
type MenuListItemField
  = | 'text'
    | 'link'
    | 'color'
    | 'fontSize'
    | 'name'
    | 'url'
    | 'width'
    | 'height'
    | 'alt'

function findRowById(rowId: string): RowNode | undefined {
  for (const canvasBlock of installed.value) {
    if (!isCanvasBlockInstance(canvasBlock))
      continue

    const row = findRowInRows(canvasBlock.block.rows, rowId)
    if (row)
      return row
  }

  return undefined
}

function findCellById(cellId: string): CellNode | undefined {
  for (const canvasBlock of installed.value) {
    if (!isCanvasBlockInstance(canvasBlock))
      continue

    const found = findCellInRows(canvasBlock.block.rows, cellId)
    if (found)
      return found
  }

  return undefined
}

function toSpacingValue(value: unknown): SpacingTool['value'] {
  const raw = (value || {}) as SpacingTool['value']
  const next: SpacingTool['value'] = {}

  if (Array.isArray(raw.padding) && raw.padding.length === 4) {
    next.padding = raw.padding.map(i => Number(i) || 0) as [number, number, number, number]
  }

  if (Array.isArray(raw.margin) && raw.margin.length === 4) {
    next.margin = raw.margin.map(i => Number(i) || 0) as [number, number, number, number]
  }

  return next
}

function toBackgroundImageValue(value: unknown): BackgroundImageTool['value'] {
  const raw = (value || {}) as Partial<BackgroundImageTool['value']>
  return {
    ...DEFAULT_BACKGROUND_IMAGE,
    ...raw,
    url: typeof raw.url === 'string' ? raw.url : '',
  }
}

function toOptionalPositiveNumber(value: unknown): number | undefined {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

function toImageValue(value: unknown): ImageTool['value'] {
  const raw = (value || {}) as Partial<ImageTool['value']>

  return {
    src: typeof raw.src === 'string' ? raw.src : '',
    alt: typeof raw.alt === 'string' ? raw.alt : '',
    link: typeof raw.link === 'string' ? raw.link : '',
    width: toOptionalPositiveNumber(raw.width),
    height: toOptionalPositiveNumber(raw.height),
  }
}

function toNonNegativeFiniteNumber(value: unknown): number | undefined {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}

function getMenuAtomItemType(atom: Extract<Atom, { type: 'menu' }>): 'text' | 'image' {
  if (atom.itemType === 'image')
    return 'image'

  if (atom.itemType === 'text')
    return 'text'

  const first = atom.items[0]
  return first?.type === 'image' ? 'image' : 'text'
}

function toMenuTextItem(item: Extract<Atom, { type: 'menu' }>['items'][number] | undefined) {
  if (item?.type === 'text')
    return { ...item }

  return {
    ...DEFAULT_MENU_TEXT_ITEM,
    text: item?.type === 'image' ? item.name : DEFAULT_MENU_TEXT_ITEM.text,
    link: item?.link || DEFAULT_MENU_TEXT_ITEM.link,
  }
}

function toMenuImageItem(item: Extract<Atom, { type: 'menu' }>['items'][number] | undefined) {
  if (item?.type === 'image')
    return { ...item }

  return {
    ...DEFAULT_MENU_IMAGE_ITEM,
    name: item?.type === 'text' ? item.text : DEFAULT_MENU_IMAGE_ITEM.name,
    link: item?.link || DEFAULT_MENU_IMAGE_ITEM.link,
  }
}

function parseMenuListField(field: string) {
  const [key, indexRaw, itemField] = field.split('::')

  if (key !== 'menuList' || !indexRaw || !itemField)
    return undefined

  const index = Number(indexRaw)
  if (!Number.isInteger(index) || index < 0)
    return undefined

  if (
    !['text', 'link', 'color', 'fontSize', 'name', 'url', 'width', 'height', 'alt'].includes(
      itemField,
    )
  ) {
    return undefined
  }

  return {
    index,
    itemField: itemField as MenuListItemField,
  }
}

function updateV2SettingsToolById(id: string, key: 'value' | 'label', value: unknown) {
  if (key !== 'value')
    return false

  const [scope, level, targetId, field] = id.split('::')
  if (scope !== 'v2-settings' || !level || !targetId || !field)
    return false

  if (level === 'block') {
    const block = findCanvasBlockInstance(targetId)?.block
    if (!block)
      return false

    if (field === 'spacing') {
      block.settings.spacing = toSpacingValue(value)
      return true
    }

    if (field === 'backgroundColor') {
      block.settings.backgroundColor = String(value ?? '')
      return true
    }

    if (field === 'backgroundImage') {
      block.settings.backgroundImage = toBackgroundImageValue(value)
      return true
    }

    return false
  }

  if (level === 'row') {
    const row = findRowById(targetId)
    if (!row)
      return false

    if (field === 'spacing') {
      row.settings.spacing = toSpacingValue(value)
      return true
    }

    if (field === 'backgroundColor') {
      row.settings.backgroundColor = String(value ?? '')
      return true
    }

    if (field === 'backgroundImage') {
      row.settings.backgroundImage = toBackgroundImageValue(value)
      return true
    }

    if (field === 'gap') {
      row.settings.gap = Number(value) || 0
      return true
    }

    if (field === 'height') {
      row.settings.height = toOptionalPositiveNumber(value)
      return true
    }

    return false
  }

  if (level === 'cell') {
    const cell = findCellById(targetId)
    if (!cell)
      return false

    if (field === 'spacing') {
      cell.settings.spacing = toSpacingValue(value)
      return true
    }

    if (field === 'backgroundColor') {
      cell.settings.backgroundColor = String(value ?? '')
      return true
    }

    if (field === 'backgroundImage') {
      cell.settings.backgroundImage = toBackgroundImageValue(value)
      return true
    }

    if (field === 'link') {
      const nextLink = String(value ?? '').trim()
      cell.settings.link = nextLink || undefined
      return true
    }

    if (field === 'borderRadius') {
      cell.settings.borderRadius = toNonNegativeFiniteNumber(value)
      return true
    }

    return false
  }

  return false
}

function updateV2AtomToolById(id: string, key: 'value' | 'label', value: unknown) {
  if (key !== 'value')
    return false

  const atom = selectedAtom.value
  if (!atom)
    return false

  const [scope, atomId, ...fieldParts] = id.split('::')
  const field = fieldParts.join('::')

  if (scope !== 'v2-atom' || atomId !== atom.id || !field)
    return false

  if (atom.type === 'text') {
    if (field === 'content') {
      atom.value = String(value ?? '')
      return true
    }

    if (field === 'color') {
      atom.color = String(value ?? '')
      return true
    }

    if (field === 'spacing') {
      atom.spacing = toSpacingValue(value)
      return true
    }

    return false
  }

  if (atom.type === 'button') {
    if (field === 'text') {
      atom.text = String(value ?? '')
      return true
    }

    if (field === 'link') {
      atom.link = String(value ?? '')
      return true
    }

    if (field === 'backgroundColor') {
      atom.backgroundColor = String(value ?? '')
      return true
    }

    if (field === 'color') {
      atom.color = String(value ?? '')
      return true
    }

    if (field === 'fontSize') {
      atom.fontSize = Number(value) || 14
      return true
    }

    if (field === 'borderRadius') {
      atom.borderRadius = Number(value) || 0
      return true
    }

    if (field === 'spacing' || field === 'padding') {
      const spacingValue = toSpacingValue(value)
      atom.spacing = spacingValue

      if (spacingValue.padding && spacingValue.padding.length === 4) {
        atom.padding = spacingValue.padding.map(i => Number(i) || 0) as [
          number,
          number,
          number,
          number,
        ]
      }
      return true
    }

    return false
  }

  if (atom.type === 'divider') {
    if (field === 'color') {
      atom.color = String(value ?? '')
      return true
    }

    if (field === 'height') {
      atom.height = Number(value) || 1
      return true
    }

    if (field === 'spacing') {
      atom.spacing = toSpacingValue(value)
      return true
    }

    return false
  }

  if (atom.type === 'image') {
    if (field === 'image') {
      const next = toImageValue(value)
      atom.src = next.src
      atom.alt = next.alt || ''
      atom.link = next.link || ''
      atom.width = next.width
      atom.height = next.height
      return true
    }

    if (field === 'borderRadius') {
      atom.borderRadius = toNonNegativeFiniteNumber(value)
      return true
    }

    if (field === 'spacing') {
      atom.spacing = toSpacingValue(value)
      return true
    }
  }

  if (atom.type === 'menu') {
    if (field === 'menuItemType') {
      const nextType = value === 'image' ? 'image' : 'text'
      atom.itemType = nextType

      atom.items = atom.items.map((item) => {
        return nextType === 'image' ? toMenuImageItem(item) : toMenuTextItem(item)
      })

      if (!atom.items.length) {
        atom.items.push(
          nextType === 'image' ? { ...DEFAULT_MENU_IMAGE_ITEM } : { ...DEFAULT_MENU_TEXT_ITEM },
        )
      }

      return true
    }

    if (field === 'gap') {
      atom.gap = toNonNegativeFiniteNumber(value) ?? DEFAULT_MENU_ATOM_GAP
      return true
    }

    if (field === 'spacing') {
      atom.spacing = toSpacingValue(value)
      return true
    }

    const parsed = parseMenuListField(field)
    if (!parsed)
      return false

    const item = atom.items[parsed.index]
    if (!item)
      return false

    const itemType = getMenuAtomItemType(atom)
    if (itemType === 'image') {
      const imageItem = item.type === 'image' ? item : toMenuImageItem(item)

      if (item.type !== 'image') {
        atom.items[parsed.index] = imageItem
      }

      if (parsed.itemField === 'name') {
        imageItem.name = String(value ?? '')
        return true
      }

      if (parsed.itemField === 'link') {
        imageItem.link = String(value ?? '')
        return true
      }

      if (parsed.itemField === 'url') {
        imageItem.url = String(value ?? '')
        return true
      }

      if (parsed.itemField === 'width') {
        imageItem.width = toOptionalPositiveNumber(value)
        return true
      }

      if (parsed.itemField === 'height') {
        imageItem.height = toOptionalPositiveNumber(value)
        return true
      }

      if (parsed.itemField === 'alt') {
        imageItem.alt = String(value ?? '')
        return true
      }

      return false
    }

    const textItem = item.type === 'text' ? item : toMenuTextItem(item)
    if (item.type !== 'text') {
      atom.items[parsed.index] = textItem
    }

    if (parsed.itemField === 'text') {
      textItem.text = String(value ?? '')
      return true
    }

    if (parsed.itemField === 'link') {
      textItem.link = String(value ?? '')
      return true
    }

    if (parsed.itemField === 'color') {
      textItem.color = String(value ?? '')
      return true
    }

    if (parsed.itemField === 'fontSize') {
      textItem.fontSize = Number(value) || 16
      return true
    }

    return true
  }

  return false
}

function updateToolById<T extends Tool>(id: string, key: 'value' | 'label', value: T['value']) {
  if (id === 'layoutPadding' && key === 'value') {
    general.padding = (value as any).padding
    return
  }

  updateV2SettingsToolById(id, key, value)
  updateV2AtomToolById(id, key, value)
}

function addNewToolToMultiTool(id: string) {
  const [scope, atomId, field] = id.split('::')
  if (scope === 'v2-atom' && field === 'menuList') {
    const atom = selectedAtom.value
    if (!atom || atom.id !== atomId || atom.type !== 'menu')
      return

    const itemType = getMenuAtomItemType(atom)
    const lastItem = atom.items[atom.items.length - 1]
    if (itemType === 'image') {
      atom.items.push(lastItem?.type === 'image' ? { ...lastItem } : { ...DEFAULT_MENU_IMAGE_ITEM })
    }
    else {
      atom.items.push(lastItem?.type === 'text' ? { ...lastItem } : { ...DEFAULT_MENU_TEXT_ITEM })
    }
  }
}

function deleteMultiToolItem(id: string, index: number) {
  const [scope, atomId, field] = id.split('::')
  if (scope === 'v2-atom' && field === 'menuList') {
    const atom = selectedAtom.value
    if (!atom || atom.id !== atomId || atom.type !== 'menu')
      return

    if (atom.items.length <= 1)
      return

    atom.items.splice(index, 1)
  }
}

export function useComponentsStore() {
  initTemplatePersistence()

  return {
    addComponent,
    addNewToolToMultiTool,
    deleteMultiToolItem,
    duplicateComponent,
    duplicateComponentById,
    editableId,
    editableIndex,
    general,
    installed,
    isDragging,
    list,
    moveComponent,
    exportTemplate,
    exportTemplateJson,
    importTemplate,
    importTemplateFromJson,
    applyImportedTemplate,
    hydrateTemplateFromLocalStorage,
    persistTemplateToLocalStorage,
    templateImportIssues,
    clearCanvas,
    removeComponent,
    removeComponentById,
    updateToolById,
    resetSelection,
    insertBlockToCanvas,
    renameBlock,
    insertRowToBlock,
    insertRowToCell,
    removeRow,
    insertCellToRow,
    removeCell,
    insertAtomToCell,
    removeAtom,
    moveAtomWithinCell,
    selectBlock,
    selectRow,
    selectCell,
    selectAtom,
    selectedBlock,
    selectedRow,
    selectedCell,
    selectedAtom,
    selectedBlockId,
    selectedRowId,
    selectedCellId,
    selectedAtomId,
    selectionLevel,
    sidebarActiveTab,
    treeScrollTarget,
    treeScrollRequestId,
    requestTreeScroll,
    installedBlocks,
    isCanvasBlockInstance,
  }
}
