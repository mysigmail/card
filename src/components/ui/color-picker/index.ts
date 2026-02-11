export { default as ColorPicker } from './ColorPicker.vue'

export const colorPickerSizes = {
  xs: {
    trigger: 'h-7 min-w-9 gap-1 px-1.5',
    swatch: 'size-4',
    chevron: 'size-3',
  },
  sm: {
    trigger: 'h-8 min-w-10 gap-1.5 px-1.5',
    swatch: 'size-5',
    chevron: 'size-3.5',
  },
  default: {
    trigger: 'h-9 min-w-11 gap-1.5 px-2',
    swatch: 'size-6',
    chevron: 'size-4',
  },
} as const

export type ColorPickerSize = keyof typeof colorPickerSizes
