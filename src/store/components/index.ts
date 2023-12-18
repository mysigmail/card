import { nanoid } from 'nanoid'
import { computed, reactive, ref, shallowRef } from 'vue'
import { cloneComponent, findToolById, getEditableToolsByGroup } from './utils'
import { menu } from '@/components/email-components/db/menu'
import { header } from '@/components/email-components/db/header'
import type { Component, GeneralTool, MultiTool, Tool } from '@/types/editor'
import type { ComponentList } from '@/types/email-components/components'
import { clone } from '@/utils'

const list = shallowRef<ComponentList[]>([
  { name: 'Menu', components: menu },
  { name: 'Header', components: header },
  { name: 'Content', components: [] },
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

const editableToolsByGroup = computed(() => {
  if (!editable.value)
    return
  return getEditableToolsByGroup(editable.value?.tools)
})

const editableTools = computed(() => {
  if (!editableToolsGroupName.value || !editableToolsByGroup.value)
    return undefined

  return editableToolsByGroup.value[editableToolsGroupName.value]
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
      tools: getEditableToolsByGroup(i.tools),
    }
  })
})

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

function updateToolById<T extends Tool>(id: string, key: 'value' | 'label', value: T['value']) {
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

  const tool = findToolById(id, editable.value.tools) as MultiTool

  if (!tool)
    return

  const clonedLastItem = clone<MultiTool['value'][0]>(tool.value[tool.value.length - 1])

  clonedLastItem.id = nanoid(8)
  clonedLastItem.tools.forEach((i) => {
    i.id = nanoid(8)
  })

  tool.value.push(clonedLastItem)
}

function deleteMultiToolItem(id: string, index: number) {
  const multiTool = editable.value?.tools.find(i => i.id === id)
  if (multiTool) {
    const tool = multiTool.value as unknown as Tool[]
    if (tool.length === 1)
      return
    tool.splice(index, 1)
  }
}

function onEditTool(name: string, index: number) {
  const id = installed.value[index].id

  if (editableId.value !== id)
    editableId.value = id

  editableToolName.value = name
  editableToolsGroupName.value = name
}

export function useComponentsStore() {
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
    editableToolsGroupName,
    general,
    installed,
    installedToolsByGroup,
    isDragging,
    list,
    moveComponent,
    onEditTool,
    removeComponent,
    updateToolById,
  }
}
