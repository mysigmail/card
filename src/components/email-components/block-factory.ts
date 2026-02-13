import type {
  Atom,
  AtomType,
  Block,
  BlockGrid,
  BlockItem,
  BlockSettings,
  ButtonAtom,
  DividerAtom,
  GridSettings,
  ImageAtom,
  ItemSettings,
  MenuAtom,
  TextAtom,
} from '@/types/block'
import { nanoid } from 'nanoid'

// --- Default Settings ---

export function createDefaultBlockSettings(): BlockSettings {
  return {
    spacing: { padding: [30, 35, 30, 35] },
    backgroundColor: '#FFFFFF',
  }
}

export function createDefaultGridSettings(): GridSettings {
  return {
    spacing: {},
    backgroundColor: 'transparent',
    gap: 0,
  }
}

export function createDefaultItemSettings(): ItemSettings {
  return {
    spacing: {},
    backgroundColor: 'transparent',
    link: undefined,
    verticalAlign: 'top',
    horizontalAlign: 'left',
    borderRadius: undefined,
  }
}

function createAtomSpacing(padding: [number, number, number, number] = [0, 0, 0, 0]) {
  return {
    margin: [0, 0, 0, 0] as [number, number, number, number],
    padding: [...padding] as [number, number, number, number],
  }
}

// --- Atom Factories ---

export function createTextAtom(value = '<p>Text</p>'): TextAtom {
  return {
    id: nanoid(8),
    type: 'text',
    value,
    color: '#111827',
    spacing: createAtomSpacing(),
  }
}

export function createButtonAtom(): ButtonAtom {
  const padding: [number, number, number, number] = [12, 24, 12, 24]

  return {
    id: nanoid(8),
    type: 'button',
    text: 'Button',
    link: 'https://example.com',
    backgroundColor: '#4F46E5',
    color: '#FFFFFF',
    fontSize: 16,
    borderRadius: 4,
    padding,
    spacing: createAtomSpacing(padding),
  }
}

export function createDividerAtom(): DividerAtom {
  return {
    id: nanoid(8),
    type: 'divider',
    color: '#E5E7EB',
    height: 1,
    spacing: createAtomSpacing(),
  }
}

export function createImageAtom(): ImageAtom {
  return {
    id: nanoid(8),
    type: 'image',
    src: '/img/logo-black.png',
    link: 'https://example.com',
    alt: 'Image',
    width: 120,
    borderRadius: 0,
    spacing: createAtomSpacing(),
  }
}

export function createMenuAtom(): MenuAtom {
  return {
    id: nanoid(8),
    type: 'menu',
    itemType: 'text',
    gap: 10,
    items: [
      {
        type: 'text',
        text: 'Specs',
        link: 'https://example',
        color: '#000000',
        fontSize: 16,
      },
      {
        type: 'text',
        text: 'Feature',
        link: 'https://example',
        color: '#000000',
        fontSize: 16,
      },
      {
        type: 'text',
        text: 'Price',
        link: 'https://example',
        color: '#000000',
        fontSize: 16,
      },
    ],
    spacing: createAtomSpacing(),
  }
}

export function createAtom(type: AtomType): Atom {
  switch (type) {
    case 'text':
      return createTextAtom()
    case 'button':
      return createButtonAtom()
    case 'divider':
      return createDividerAtom()
    case 'image':
      return createImageAtom()
    case 'menu':
      return createMenuAtom()
  }
}

// --- Structural Factories ---

export function createItem(atoms?: Atom[]): BlockItem {
  return {
    id: nanoid(8),
    settings: createDefaultItemSettings(),
    atoms: atoms ?? [createTextAtom()],
    grids: [],
  }
}

export function createGrid(items?: BlockItem[]): BlockGrid {
  return {
    id: nanoid(8),
    settings: createDefaultGridSettings(),
    items: items ?? [createItem()],
  }
}

export function createBlock(label = 'Block', grids?: BlockGrid[]): Block {
  return {
    id: nanoid(8),
    label,
    settings: createDefaultBlockSettings(),
    grids: grids ?? [createGrid()],
  }
}
