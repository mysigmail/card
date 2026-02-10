import type { Component, GeneralTool, GridTool, MultiTool, Tool } from '@/types/editor'
import type { ComponentList } from '@/types/email-components/components'
import { nanoid } from 'nanoid'
import { computed, reactive, ref, shallowRef } from 'vue'
import { content } from '@/components/email-components/catalog/content'
import { header } from '@/components/email-components/catalog/header'
import { menu } from '@/components/email-components/catalog/menu'
import {
  cloneComponent,
  findToolById,
  getEditableToolsByGroup,
  getToolGroups,
} from '@/store/components/utils'
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
    removeComponent,
    updateToolById,
  }
}
