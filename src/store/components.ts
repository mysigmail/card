import { nanoid } from 'nanoid'
import { defineStore } from 'pinia'
import { menu } from '@/components/email-components/db/menu'
import type { Component, MultiTool, Tool } from '@/types/editor'
import type { ComponentsState } from '@/types/store/components'
import { clone } from '@/utils'

export const useComponentsStore = defineStore('components', {
  state: (): ComponentsState => ({
    list: [
      { name: 'Menu', components: menu },
      { name: 'Header', components: [] },
      { name: 'Content', components: [] },
      { name: 'Feature', components: [] },
      { name: 'Call to Action', components: [] },
      { name: 'E-Commerce', components: [] },
      { name: 'Footer', components: [] },
    ],
    installed: [],
    editable: undefined,
    isDragging: false,
  }),

  getters: {
    editableToolsByGroup(): Record<string, Tool[]> {
      if (!this.editable)
        return {}

      const groupsWithTools: any = {}

      this.editable.tools.forEach((i) => {
        if (!i.group)
          return

        if (!groupsWithTools[i.group])
          groupsWithTools[i.group] = []

        if (groupsWithTools[i.group])
          groupsWithTools[i.group].push(i)
      })

      return groupsWithTools
    },
    editableIndex(): number {
      if (!this.installed?.length)
        return -1

      return this.installed?.findIndex(i => i.id === this.editable?.id)
    },
  },
  actions: {
    addComponent(component: Component, index?: number) {
      const cloned = clone(component)
      cloned.id = nanoid(8)

      if (index !== undefined)
        this.installed?.splice(index, 0, cloned)
      else
        this.installed?.push(cloned)
    },
    duplicateComponent(component: Component, index: number) {
      const cloned = clone(component)
      cloned.id = nanoid(8)

      this.installed?.splice(index + 1, 0, cloned)
    },
    moveComponent(oldIndex: number, newIndex: number) {
      const component = this.installed?.[oldIndex]

      if (!component)
        return

      this.installed?.splice(oldIndex, 1)
      this.installed?.splice(newIndex, 0, component)
    },
    remove(index: number) {
      this.installed?.splice(index, 1)
    },
    setEditable(component: Component | null) {
      if (!component) {
        this.editable = undefined
        return
      }

      this.editable = component
    },
    findToolById(id: string, tools: Tool[]): Tool | undefined {
      for (const tool of tools) {
        if (tool.id === id)
          return tool

        if (tool.type === 'multi') {
          for (const multiTool of (tool as MultiTool).value) {
            const desired = this.findToolById(id, multiTool.tools)
            if (desired)
              return desired
          }
        }
      }
    },
    updateToolById<T extends Tool>(
      id: string,
      key: 'value' | 'label',
      value: T['value'],
    ) {
      if (!this.editable?.tools)
        return

      const tool = this.findToolById(id, this.editable.tools)

      if (tool) {
        ;(tool as any)[key] = value
      }
    },
    addNewToolToMultiTool(id: string) {
      if (!this.editable?.tools)
        return

      const tool = this.findToolById(id, this.editable.tools) as MultiTool

      if (!tool)
        return

      const clonedLastItem = clone<MultiTool['value'][0]>(
        tool.value[tool.value.length - 1],
      )

      clonedLastItem.id = nanoid(8)
      clonedLastItem.tools.forEach((i) => {
        i.id = nanoid(8)
      })

      tool.value.push(clonedLastItem)
    },
    deleteMultiToolItem(id: string, index: number) {
      const multiTool = this.editable?.tools.find(i => i.id === id)
      if (multiTool) {
        const tool = multiTool.value as unknown as Tool[]
        if (tool.length === 1)
          return
        tool.splice(index, 1)
      }
    },
  },
})
