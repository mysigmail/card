import type { ImageTool } from '../editor'

export interface Menu {
  color: string
  fontSize: number | string
  text: string
  link: string
}

export interface MenuItemText {
  color: string
  fontSize: number | string
  text: string
  link: string
}

export interface MenuItemImg {
  image: ImageTool['value']
  link: string
}
