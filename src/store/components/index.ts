import { nanoid } from 'nanoid'
import { computed, reactive, ref, shallowRef } from 'vue'
import { cloneComponent, findToolById } from './utils'
import { menu } from '@/components/email-components/db/menu'
import type { Component, GeneralTool, MultiTool, Tool } from '@/types/editor'
import type { ComponentList } from '@/types/email-components/components'
import { clone } from '@/utils'

const list = shallowRef<ComponentList[]>([
  { name: 'Menu', components: menu },
  { name: 'Header', components: [] },
  { name: 'Content', components: [] },
  { name: 'Feature', components: [] },
  { name: 'Call to Action', components: [] },
  { name: 'E-Commerce', components: [] },
  { name: 'Footer', components: [] },
])

const installed = ref<Component[]>([])
const editable = ref<Component | undefined>(undefined)
const isDragging = ref(false)

const general = reactive<GeneralTool>({
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

const editableToolsByGroup = computed(() => {
  if (!editable.value)
    return {}

  const groupsWithTools: Record<string, Tool[]> = {}

  editable.value.tools.forEach((i) => {
    if (!i.group)
      return

    if (!groupsWithTools[i.group])
      groupsWithTools[i.group] = []

    if (groupsWithTools[i.group])
      groupsWithTools[i.group].push(i)
  })

  return groupsWithTools
})

const editableIndex = computed(() => {
  if (!installed.value?.length)
    return -1

  return installed.value?.findIndex(i => i.id === editable.value?.id)
})

function addComponent(component: Component, index?: number) {
  const cloned = cloneComponent(component)

  if (index !== undefined)
    installed.value.splice(index, 0, cloned)
  else installed.value.push(cloned)
}

function duplicateComponent(component: Component, index: number) {
  const cloned = cloneComponent(component)

  installed.value.splice(index + 1, 0, cloned)
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

function setEditable(component: Component | null) {
  if (!component) {
    editable.value = undefined
    return
  }

  editable.value = component
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

export function useComponentsStore() {
  return {
    list,
    installed,
    editable,
    isDragging,
    editableToolsByGroup,
    editableIndex,
    general,
    addComponent,
    duplicateComponent,
    moveComponent,
    removeComponent,
    setEditable,
    updateToolById,
    addNewToolToMultiTool,
    deleteMultiToolItem,
  }
}
