import type { Component, ImageTool } from '../editor'

export interface ComponentList {
  name: string
  components: Component[]
}

export interface Menu {
  color: string
  fontSize: number | string
  text: string
  link: string
}

export interface Social {
  image: ImageTool['value']
  link: string
}
