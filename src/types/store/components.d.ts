import type { Component } from '../editor'

interface ComponentList {
  name: string
  components: Component[]
}

export interface ComponentsState {
  list: ComponentList[]
  installed?: Component[]
  editable?: Component
  isDragging: boolean
}
