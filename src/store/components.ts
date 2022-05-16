import { menu } from '@/components/editor/components/menu'
import type { ComponentsState } from '@/types/store/components'
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
    ]
  })
})
