import { menu } from '@/components/editor/components/menu'
import type { Tool, ToolValue } from '@/types/editor'
import type { ComponentsState } from '@/types/store/components'
import { nanoid } from 'nanoid'
import { defineStore } from 'pinia'

export const useComponentsStore = defineStore('components', {
  state: (): ComponentsState => ({
    list: [
      { name: 'Menu', components: menu },
      { name: 'Header', components: [] },
      { name: 'Content', components: [] },
      { name: 'Feature', components: [] },
      { name: 'Call to Action', components: [] },
      { name: 'E-Commerce', components: [] },
      { name: 'Footer', components: [] }
    ],
    installed: undefined,
    editable: menu[0]
  }),

  getters: {
    editableToolsByGroup (): Record<string, Tool[]> {
      if (!this.editable) return {}

      const groupsWithTools: any = {}

      this.editable.tools.forEach(i => {
        if (!i.group) return

        if (!groupsWithTools[i.group]) groupsWithTools[i.group] = []

        if (groupsWithTools[i.group]) {
          groupsWithTools[i.group].push(i)
        }
      })

      return groupsWithTools
    }
  },
  actions: {
    findToolById (id: string, tools: Tool[]): Tool | undefined {
      for (const tool of tools) {
        if (tool.id === id) return tool

        if (tool.type === 'multi') {
          const desired = this.findToolById(id, tool.value as Tool[])
          if (desired) return desired
        }
      }
    },
    updateToolById<T extends ToolValue> (
      id: string,
      key: 'value' | 'label',
      value: T
    ) {
      const tool = this.findToolById(id, this.editable?.tools!)

      if (tool) (tool as any)[key] = value
    },
    addNewToolToMultiTool (id: string, item?: Tool) {
      const tool = this.findToolById(id, this.editable?.tools!)

      if (tool?.value) {
        const value = tool.value as Tool[]
        const clonedLatest = JSON.parse(
          JSON.stringify(value[value.length - 1])
        ) as Tool

        clonedLatest.id = nanoid(8)
        clonedLatest.value = (clonedLatest.value as Tool[]).map(i => {
          i.id = nanoid(8)
          return i
        })

        value.push(clonedLatest)
      }
    },
    deleteMultiToolItem (id: string, index: number) {
      const multiTool = this.editable?.tools.find(i => i.id === id)
      if (multiTool) {
        const tool = multiTool.value as Tool[]
        if (tool.length === 1) return
        tool.splice(index, 1)
      }
    }
  }
})
