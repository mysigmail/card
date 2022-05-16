import type { ComponentCreator } from '@/types/editor'
import { images } from '../../images'

const menu1: ComponentCreator = (theme, label) => {
  const preview =
    theme === 'dark'
      ? images.components.menu1.dark
      : images.components.menu1.light

  return {
    name: 'menu-1',
    label,
    type: 'menu',
    preview,
    tools: {}
  }
}

export const menu = [menu1('light', 'Menu 1'), menu1('dark', 'Menu 2')]
