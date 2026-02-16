import type { BlockLibraryCategory, CanvasBlockInstance, GeneralTool, PreviewMode } from './types'
import type { TemplateValidationIssue } from '@/entities/template'
import { reactive, ref, shallowRef } from 'vue'
import {
  content,
  cta,
  ecommerce,
  feature,
  footer,
  header,
  menu,
} from '@/features/email-preview/catalog/load-blocks'

export const library = shallowRef<BlockLibraryCategory[]>([
  { name: 'Menu', components: menu },
  { name: 'Header', components: header },
  { name: 'Content', components: content },
  { name: 'Feature', components: feature },
  { name: 'Call to Action', components: cta },
  { name: 'E-Commerce', components: ecommerce },
  { name: 'Footer', components: footer },
])

export const installed = ref<CanvasBlockInstance[]>([])
export const editableId = ref<string>()
export const isDragging = ref(false)
export const previewMode = ref<PreviewMode>('desktop')
export const templateImportIssues = ref<TemplateValidationIssue[]>([])

export const general = reactive<GeneralTool>({
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
