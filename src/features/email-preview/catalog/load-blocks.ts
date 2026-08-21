import type { BlockPreset as CatalogBlock, ComponentType } from '@/entities/template'
import { nanoid } from 'nanoid'

interface CatalogBlockJsonData {
  version: 1
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
  transactional: [
    'transactional1',
    'transactional2',
    'transactional3',
    'transactional4',
    'transactional5',
    'transactional6',
    'transactional7',
    'transactional8',
    'transactional9',
  ],
  header: [
    'header1',
    'header2',
    'header3',
    'header4',
    'header5',
    'header6',
    'header7',
    'header8',
    'header9',
    'header10',
  ],
  content: [
    'content1',
    'content2',
    'content3',
    'content4',
    'content5',
    'content6',
    'content7',
    'content8',
    'content9',
    'content10',
    'content11',
    'content12',
    'content13',
    'content14',
    'content15',
    'content16',
  ],
  feature: [
    'feature1',
    'feature2',
    'feature3',
    'feature4',
    'feature5',
    'feature6',
    'feature7',
    'feature8',
  ],
  cta: [
    'cta-1',
    'cta-2',
    'cta-3',
    'cta-4',
    'cta-5',
    'cta-6',
    'cta-7',
    'cta-8',
    'cta-9',
    'cta-10',
    'cta-11',
    'cta-12',
  ],
  ecommerce: [
    'ecommerce1',
    'ecommerce2',
    'ecommerce3',
    'ecommerce4',
    'ecommerce5',
    'ecommerce6',
    'ecommerce7',
  ],
  footer: [
    'footer1-dark',
    'footer2-dark',
    'footer3-dark',
    'footer4-dark',
    'footer1-light',
    'footer2-light',
    'footer3-light',
    'footer4-light',
  ],
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
  if (data.version !== 1)
    throw new Error(`Unsupported catalog block version: ${String(data.version)}`)

  return {
    id: nanoid(8),
    version: 1,
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
export const transactional = loadBlocksByType('transactional')
