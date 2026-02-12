import type { Component, GeneralTool, GridTool, MultiTool, Tool } from '@/types/editor'
import type { ComponentList } from '@/types/email-components/components'
import type {
  TemplateExportV1,
  TemplateImportMode,
  TemplateValidationIssue,
} from '@/types/template'
import { nanoid } from 'nanoid'
import { computed, reactive, ref, shallowRef, watch } from 'vue'
import { content } from '@/components/email-components/catalog/content'
import { header } from '@/components/email-components/catalog/header'
import { menu } from '@/components/email-components/catalog/menu'
import {
  createRuntimeComponents,
  createTemplateExportPayload,
  parseTemplateExportJson,
  parseTemplateExportPayload,
} from '@/store/components/template-io'
import {
  cloneComponent,
  findToolById,
  getEditableToolsByGroup,
  getToolGroups,
} from '@/store/components/utils'
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
const installed = ref<Component[]>([])
const editableId = ref<string>()
const editableToolsGroupName = ref<string>()
const editableToolName = ref<string>()
const isDragging = ref(false)
const templateImportIssues = ref<TemplateValidationIssue[]>([])

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

// Computed
const editable = computed(() => {
  if (!editableId.value)
    return undefined

  return installed.value.find(i => i.id === editableId.value)
})

const editableToolGroups = computed(() => {
  if (!editable.value)
    return undefined

  return getToolGroups(editable.value.tools)
})

const editableToolsByGroup = computed(() => {
  if (!editableToolGroups.value)
    return

  return getEditableToolsByGroup(editable.value!.tools)
})

const editableTools = computed(() => {
  if (!editableToolsGroupName.value || !editableToolsByGroup.value)
    return undefined

  return editableToolsByGroup.value[editableToolsGroupName.value]
})

const editableToolsGroupLabel = computed(() => {
  if (!editableToolsGroupName.value || !editableToolGroups.value)
    return undefined

  return (
    editableToolGroups.value.find(i => i.id === editableToolsGroupName.value)?.label
    || editableToolsGroupName.value
  )
})

const editableIndex = computed(() => {
  if (!installed.value?.length)
    return -1

  return installed.value?.findIndex(i => i.id === editable.value?.id)
})

const installedToolsByGroup = computed(() => {
  return installed.value.map((i) => {
    return {
      id: i.id,
      name: i.label,
      groups: getToolGroups(i.tools),
    }
  })
})

function resetSelection() {
  editableId.value = undefined
  editableToolName.value = undefined
  editableToolsGroupName.value = undefined
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
function addComponent(component: Component, index?: number) {
  const cloned = cloneComponent(component)

  if (index !== undefined)
    installed.value.splice(index, 0, cloned)
  else installed.value.push(cloned)
}

function duplicateComponent(installedIndex: number) {
  const cloned = cloneComponent(installed.value[installedIndex])

  installed.value.splice(installedIndex + 1, 0, cloned)
}

function moveComponent(oldIndex: number, newIndex: number) {
  const component = installed.value[oldIndex]

  if (!component)
    return

  installed.value.splice(oldIndex, 1)
  installed.value.splice(newIndex, 0, component)
}

function removeComponent(index: number) {
  installed.value.splice(index, 1)
}

function clearCanvas() {
  installed.value = []
  templateImportIssues.value = []
  resetSelection()
}

function updateToolById<T extends Tool>(id: string, key: 'value' | 'label', value: T['value']) {
  if (id === 'layoutPadding' && key === 'value') {
    general.padding = (value as any).padding
    return
  }

  if (!editable.value?.tools)
    return

  const tool = findToolById(id, editable.value.tools)

  if (tool) {
    ;(tool as any)[key] = value
  }
}

function addNewToolToMultiTool(id: string) {
  if (!editable.value?.tools)
    return

  const tool = findToolById(id, editable.value.tools)

  if (!tool || (tool.type !== 'multi' && tool.type !== 'grid'))
    return

  const clonedLastItem = clone<MultiTool['value'][0] | GridTool['value'][0]>(
    tool.value[tool.value.length - 1],
  )

  clonedLastItem.id = nanoid(8)
  clonedLastItem.tools.forEach((i) => {
    i.id = nanoid(8)
  })

  tool.value.push(clonedLastItem)
}

function deleteMultiToolItem(id: string, index: number) {
  if (!editable.value?.tools)
    return

  const tool = findToolById(id, editable.value.tools)

  if (!tool || (tool.type !== 'multi' && tool.type !== 'grid'))
    return

  if (tool.value.length === 1)
    return

  tool.value.splice(index, 1)
}

function onEditTool(groupId: string, index: number) {
  const id = installed.value[index].id

  if (editableId.value !== id)
    editableId.value = id

  editableToolName.value = groupId
  editableToolsGroupName.value = groupId
}

export function useComponentsStore() {
  initTemplatePersistence()

  return {
    addComponent,
    addNewToolToMultiTool,
    deleteMultiToolItem,
    duplicateComponent,
    editable,
    editableId,
    editableIndex,
    editableToolName,
    editableTools,
    editableToolsByGroup,
    editableToolsGroupLabel,
    editableToolsGroupName,
    general,
    installed,
    installedToolsByGroup,
    isDragging,
    list,
    moveComponent,
    onEditTool,
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
    updateToolById,
  }
}
