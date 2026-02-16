import type { BlockPreset as CatalogBlock, ComponentType } from '@/entities/template'
import { nanoid } from 'nanoid'

interface CatalogBlockJsonData {
  version: 2
  name: string
  label: string
  type: ComponentType
  preview: string
  block: CatalogBlock['block']
}

const BLOCK_ORDER: Record<ComponentType, string[]> = {
  menu: [
    'menu1-dark',
    'menu2-dark',
    'menu3-dark',
    'menu4-dark',
    'menu1-light',
    'menu2-light',
    'menu3-light',
    'menu4-light',
  ],
  header: [],
  content: [],
  feature: [],
  cta: [],
  ecommerce: [],
  footer: [],
}

const basePath = import.meta.env.VITE_APP_BASE_PATH || '/'

const blockModules = import.meta.glob<CatalogBlockJsonData>(['./blocks/*.json'], {
  eager: true,
  import: 'default',
})

function resolvePreview(relativePath: string): string {
  return `${basePath}${relativePath}`
}

function toCatalogBlock(data: CatalogBlockJsonData): CatalogBlock {
  return {
    id: nanoid(8),
    version: 2,
    name: data.name,
    label: data.label,
    type: data.type,
    preview: resolvePreview(data.preview),
    block: data.block,
  }
}

function loadBlocksByType(type: ComponentType): CatalogBlock[] {
  const order = BLOCK_ORDER[type] ?? []

  const blocks = Object.values(blockModules)
    .filter(data => data.type === type)
    .map(toCatalogBlock)

  return blocks.sort((a, b) => {
    const indexA = order.indexOf(a.name)
    const indexB = order.indexOf(b.name)
    // Незарегистрированные блоки перемещаются в конец, сохраняя свой относительный порядок.
    const posA = indexA === -1 ? order.length : indexA
    const posB = indexB === -1 ? order.length : indexB
    return posA - posB
  })
}

export const content = loadBlocksByType('content')
export const header = loadBlocksByType('header')
export const menu = loadBlocksByType('menu')
export const feature = loadBlocksByType('feature')
export const cta = loadBlocksByType('cta')
export const ecommerce = loadBlocksByType('ecommerce')
export const footer = loadBlocksByType('footer')
