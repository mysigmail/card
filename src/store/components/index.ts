import type { Atom, AtomType, Block, BlockGrid, BlockItem } from '@/types/block'
import type {
  BackgroundImageTool,
  BlockComponent,
  CanvasItem,
  CatalogComponent,
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
  createBlock,
  createGrid,
  createItem,
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

// State
const installed = ref<CanvasItem[]>([])
const editableId = ref<string>()
const isDragging = ref(false)
const templateImportIssues = ref<TemplateValidationIssue[]>([])

// Block v2 selection state
export type BlockSelectionLevel = 'block' | 'grid' | 'item' | 'atom'
export type SidebarTab = 'components' | 'tree'
const selectedBlockId = ref<string>()
const selectedGridId = ref<string>()
const selectedItemId = ref<string>()
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

// --- V2 Type Guards ---

function isBlockComponent(item: CanvasItem): item is BlockComponent {
  return item.version === 2
}

// Computed
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
  selectedGridId.value = undefined
  selectedItemId.value = undefined
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
function addComponent(component: CatalogComponent, index?: number) {
  const clonedBlock = clone(component.block)
  remapBlockNodeIds(clonedBlock)

  const cloned: BlockComponent = {
    id: nanoid(8),
    version: 2,
    block: clonedBlock,
  }

  if (index !== undefined)
    installed.value.splice(index, 0, cloned)
  else installed.value.push(cloned)
}

function remapItemNodeIds(item: BlockItem) {
  item.id = nanoid(8)
  item.atoms.forEach((atom) => {
    atom.id = nanoid(8)
  })
  item.grids.forEach((grid) => {
    remapGridNodeIds(grid)
  })
}

function remapGridNodeIds(grid: BlockGrid) {
  grid.id = nanoid(8)
  grid.items.forEach((item) => {
    remapItemNodeIds(item)
  })
}

function remapBlockNodeIds(block: Block) {
  block.id = nanoid(8)
  block.grids.forEach((grid) => {
    remapGridNodeIds(grid)
  })
}

function findGridInGrids(grids: BlockGrid[], gridId: string): BlockGrid | undefined {
  for (const grid of grids) {
    if (grid.id === gridId)
      return grid

    for (const item of grid.items) {
      const nested = findGridInGrids(item.grids, gridId)
      if (nested)
        return nested
    }
  }

  return undefined
}

function findGridContainerInGrids(
  grids: BlockGrid[],
  gridId: string,
  isTopLevel = false,
): { container: BlockGrid[], index: number, isTopLevel: boolean } | undefined {
  for (const [index, grid] of grids.entries()) {
    if (grid.id === gridId) {
      return {
        container: grids,
        index,
        isTopLevel,
      }
    }

    for (const item of grid.items) {
      const nested = findGridContainerInGrids(item.grids, gridId, false)
      if (nested)
        return nested
    }
  }

  return undefined
}

function findItemInGrids(grids: BlockGrid[], itemId: string): BlockItem | undefined {
  for (const grid of grids) {
    const found = grid.items.find(i => i.id === itemId)
    if (found)
      return found

    for (const item of grid.items) {
      const nested = findItemInGrids(item.grids, itemId)
      if (nested)
        return nested
    }
  }

  return undefined
}

// --- Block v2 CRUD ---

function findBlockComponent(blockId: string): BlockComponent | undefined {
  return installed.value.find(
    (i): i is BlockComponent => isBlockComponent(i) && i.block.id === blockId,
  )
}

function addBlockToCanvas(label?: string, index?: number) {
  const block = createBlock(label)
  const blockComponent: BlockComponent = {
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
  const bc = findBlockComponent(blockId)
  if (!bc)
    return

  const nextLabel = label.trim()
  if (!nextLabel)
    return

  bc.block.label = nextLabel

  return bc.block
}

function addGridToBlock(blockId: string, insertIndex?: number) {
  const bc = findBlockComponent(blockId)
  if (!bc)
    return

  const grid = createGrid()
  if (insertIndex !== undefined)
    bc.block.grids.splice(insertIndex, 0, grid)
  else bc.block.grids.push(grid)

  return grid
}

function removeGridFromBlock(blockId: string, gridId: string) {
  const bc = findBlockComponent(blockId)
  if (!bc)
    return

  const target = findGridContainerInGrids(bc.block.grids, gridId, true)
  if (!target)
    return

  if (target.isTopLevel && target.container.length <= 1)
    return

  target.container.splice(target.index, 1)
  if (selectedGridId.value === gridId)
    selectBlock(blockId)
}

function addGridToItem(blockId: string, gridId: string, itemId: string, insertIndex?: number) {
  const bc = findBlockComponent(blockId)
  if (!bc)
    return

  const parentGrid = findGridInGrids(bc.block.grids, gridId)
  if (!parentGrid)
    return

  const item = parentGrid.items.find(i => i.id === itemId)
  if (!item)
    return

  const nestedGrid = createGrid()
  if (insertIndex !== undefined)
    item.grids.splice(insertIndex, 0, nestedGrid)
  else item.grids.push(nestedGrid)

  return nestedGrid
}

function addItemToGrid(blockId: string, gridId: string, insertIndex?: number) {
  const bc = findBlockComponent(blockId)
  if (!bc)
    return

  const grid = findGridInGrids(bc.block.grids, gridId)
  if (!grid)
    return

  const item = createItem()
  if (insertIndex !== undefined)
    grid.items.splice(insertIndex, 0, item)
  else grid.items.push(item)

  return item
}

function removeItemFromGrid(blockId: string, gridId: string, itemId: string) {
  const bc = findBlockComponent(blockId)
  if (!bc)
    return

  const grid = findGridInGrids(bc.block.grids, gridId)
  if (!grid || grid.items.length <= 1)
    return

  const idx = grid.items.findIndex(i => i.id === itemId)
  if (idx !== -1) {
    grid.items.splice(idx, 1)
    if (selectedItemId.value === itemId)
      selectGrid(blockId, gridId)
  }
}

function addAtomToItem(
  blockId: string,
  gridId: string,
  itemId: string,
  atomType: AtomType,
  insertIndex?: number,
) {
  const bc = findBlockComponent(blockId)
  if (!bc)
    return

  const grid = findGridInGrids(bc.block.grids, gridId)
  if (!grid)
    return

  const item = grid.items.find(i => i.id === itemId)
  if (!item)
    return

  const atom = createAtom(atomType)
  if (insertIndex !== undefined)
    item.atoms.splice(insertIndex, 0, atom)
  else item.atoms.push(atom)

  return atom
}

function removeAtomFromItem(blockId: string, gridId: string, itemId: string, atomId: string) {
  const bc = findBlockComponent(blockId)
  if (!bc)
    return

  const grid = findGridInGrids(bc.block.grids, gridId)
  if (!grid)
    return

  const item = grid.items.find(i => i.id === itemId)
  if (!item)
    return

  const idx = item.atoms.findIndex(a => a.id === atomId)
  if (idx !== -1) {
    item.atoms.splice(idx, 1)
    if (selectedAtomId.value === atomId)
      selectItem(blockId, gridId, itemId)
  }
}

function moveAtomInItem(
  blockId: string,
  gridId: string,
  itemId: string,
  oldIndex: number,
  newIndex: number,
) {
  const bc = findBlockComponent(blockId)
  if (!bc)
    return

  const grid = findGridInGrids(bc.block.grids, gridId)
  if (!grid)
    return

  const item = grid.items.find(i => i.id === itemId)
  if (!item)
    return

  const [atom] = item.atoms.splice(oldIndex, 1)
  if (atom)
    item.atoms.splice(newIndex, 0, atom)
}

function selectBlock(blockId: string, options?: { syncTree?: boolean }) {
  const bc = findBlockComponent(blockId)
  if (!bc)
    return

  editableId.value = bc.id

  selectedBlockId.value = blockId
  selectedGridId.value = undefined
  selectedItemId.value = undefined
  selectedAtomId.value = undefined
  selectionLevel.value = 'block'

  if (options?.syncTree !== false)
    openTreeAndScroll(`block:${blockId}`)
}

function selectGrid(blockId: string, gridId: string, options?: { syncTree?: boolean }) {
  selectBlock(blockId, { syncTree: false })
  selectedGridId.value = gridId
  selectedItemId.value = undefined
  selectedAtomId.value = undefined
  selectionLevel.value = 'grid'

  if (options?.syncTree !== false)
    openTreeAndScroll(`grid:${gridId}`)
}

function selectItem(
  blockId: string,
  gridId: string,
  itemId: string,
  options?: { syncTree?: boolean },
) {
  selectGrid(blockId, gridId, { syncTree: false })
  selectedItemId.value = itemId
  selectedAtomId.value = undefined
  selectionLevel.value = 'item'

  if (options?.syncTree !== false)
    openTreeAndScroll(`item:${itemId}`)
}

function selectAtom(
  blockId: string,
  gridId: string,
  itemId: string,
  atomId: string,
  options?: { syncTree?: boolean },
) {
  selectItem(blockId, gridId, itemId, { syncTree: false })
  selectedAtomId.value = atomId
  selectionLevel.value = 'atom'

  if (options?.syncTree !== false)
    openTreeAndScroll(`atom:${atomId}`)
}

// --- Block v2 computed ---

const selectedBlock = computed((): Block | undefined => {
  if (!selectedBlockId.value)
    return undefined
  return findBlockComponent(selectedBlockId.value)?.block
})

const selectedGrid = computed((): BlockGrid | undefined => {
  if (!selectedBlock.value || !selectedGridId.value)
    return undefined
  return findGridInGrids(selectedBlock.value.grids, selectedGridId.value)
})

const selectedItem = computed((): BlockItem | undefined => {
  if (!selectedGrid.value || !selectedItemId.value)
    return undefined
  return selectedGrid.value.items.find(i => i.id === selectedItemId.value)
})

const selectedAtom = computed((): Atom | undefined => {
  if (!selectedItem.value || !selectedAtomId.value)
    return undefined
  return selectedItem.value.atoms.find(a => a.id === selectedAtomId.value)
})

const installedBlocks = computed(() => {
  return installed.value.filter(isBlockComponent)
})

function duplicateComponent(installedIndex: number) {
  const item = installed.value[installedIndex]
  if (!item || !isBlockComponent(item))
    return

  const clonedBlock = clone(item.block)
  remapBlockNodeIds(clonedBlock)

  const cloned: BlockComponent = {
    id: nanoid(8),
    version: 2,
    block: clonedBlock,
  }
  installed.value.splice(installedIndex + 1, 0, cloned)
}

function duplicateComponentById(componentId: string) {
  const index = installed.value.findIndex(item => item.id === componentId)
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
  const index = installed.value.findIndex(item => item.id === componentId)
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

function findGridById(gridId: string): BlockGrid | undefined {
  for (const item of installed.value) {
    if (!isBlockComponent(item))
      continue

    const grid = findGridInGrids(item.block.grids, gridId)
    if (grid)
      return grid
  }

  return undefined
}

function findItemById(itemId: string): BlockItem | undefined {
  for (const item of installed.value) {
    if (!isBlockComponent(item))
      continue

    const found = findItemInGrids(item.block.grids, itemId)
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
    const block = findBlockComponent(targetId)?.block
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

  if (level === 'grid') {
    const grid = findGridById(targetId)
    if (!grid)
      return false

    if (field === 'spacing') {
      grid.settings.spacing = toSpacingValue(value)
      return true
    }

    if (field === 'backgroundColor') {
      grid.settings.backgroundColor = String(value ?? '')
      return true
    }

    if (field === 'backgroundImage') {
      grid.settings.backgroundImage = toBackgroundImageValue(value)
      return true
    }

    if (field === 'gap') {
      grid.settings.gap = Number(value) || 0
      return true
    }

    if (field === 'height') {
      grid.settings.height = toOptionalPositiveNumber(value)
      return true
    }

    return false
  }

  if (level === 'item') {
    const item = findItemById(targetId)
    if (!item)
      return false

    if (field === 'spacing') {
      item.settings.spacing = toSpacingValue(value)
      return true
    }

    if (field === 'backgroundColor') {
      item.settings.backgroundColor = String(value ?? '')
      return true
    }

    if (field === 'backgroundImage') {
      item.settings.backgroundImage = toBackgroundImageValue(value)
      return true
    }

    if (field === 'link') {
      const nextLink = String(value ?? '').trim()
      item.settings.link = nextLink || undefined
      return true
    }

    if (field === 'borderRadius') {
      item.settings.borderRadius = toNonNegativeFiniteNumber(value)
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
    // v2 block methods
    addBlockToCanvas,
    renameBlock,
    addGridToBlock,
    addGridToItem,
    removeGridFromBlock,
    addItemToGrid,
    removeItemFromGrid,
    addAtomToItem,
    removeAtomFromItem,
    moveAtomInItem,
    // v2 selection
    selectBlock,
    selectGrid,
    selectItem,
    selectAtom,
    selectedBlock,
    selectedGrid,
    selectedItem,
    selectedAtom,
    selectedBlockId,
    selectedGridId,
    selectedItemId,
    selectedAtomId,
    selectionLevel,
    sidebarActiveTab,
    treeScrollTarget,
    treeScrollRequestId,
    requestTreeScroll,
    installedBlocks,
    isBlockComponent,
  }
}
