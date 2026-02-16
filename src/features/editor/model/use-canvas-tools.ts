import type { GeneralTool, Tool } from './types'
import { findCanvasBlockInstance, findCellById, findRowById } from './lib/canvas-state-utils'
import { general } from './state'
import {
  DEFAULT_MENU_ATOM_GAP,
  DEFAULT_MENU_IMAGE_ITEM,
  DEFAULT_MENU_TEXT_ITEM,
  getMenuAtomItemType,
  parseMenuListField,
  toBackgroundImageValue,
  toImageValue,
  toMenuImageItem,
  toMenuTextItem,
  toNonNegativeFiniteNumber,
  toOptionalPositiveNumber,
  toSpacingValue,
} from './tools'
import { useSelection } from './use-selection'

let _instance: ReturnType<typeof _createCanvasTools> | null = null

function _createCanvasTools() {
  const selection = useSelection()

  function updateV2SettingsToolById(id: string, key: 'value' | 'label', value: unknown) {
    if (key !== 'value')
      return false

    const [scope, level, targetId, field] = id.split('::')
    if (scope !== 'v2-settings' || !level || !targetId || !field)
      return false

    if (level === 'block') {
      const block = findCanvasBlockInstance(targetId)?.block
      if (!block)
        return false

      if (field === 'spacing') {
        block.settings.spacing = toSpacingValue(value)
        return true
      }

      if (field === 'backgroundColor') {
        block.settings.backgroundColor = String(value ?? '')
        return true
      }

      if (field === 'backgroundImage') {
        block.settings.backgroundImage = toBackgroundImageValue(value)
        return true
      }

      return false
    }

    if (level === 'row') {
      const row = findRowById(targetId)
      if (!row)
        return false

      if (field === 'spacing') {
        row.settings.spacing = toSpacingValue(value)
        return true
      }

      if (field === 'backgroundColor') {
        row.settings.backgroundColor = String(value ?? '')
        return true
      }

      if (field === 'backgroundImage') {
        row.settings.backgroundImage = toBackgroundImageValue(value)
        return true
      }

      if (field === 'gap') {
        row.settings.gap = Number(value) || 0
        return true
      }

      if (field === 'hiddenOnMobile') {
        row.settings.hiddenOnMobile = Boolean(value)
        return true
      }

      if (field === 'collapseOnMobile') {
        row.settings.collapseOnMobile = Boolean(value)
        return true
      }

      if (field === 'height') {
        row.settings.height = toOptionalPositiveNumber(value)
        return true
      }

      return false
    }

    if (level === 'cell') {
      const cell = findCellById(targetId)
      if (!cell)
        return false

      if (field === 'spacing') {
        cell.settings.spacing = toSpacingValue(value)
        return true
      }

      if (field === 'backgroundColor') {
        cell.settings.backgroundColor = String(value ?? '')
        return true
      }

      if (field === 'backgroundImage') {
        cell.settings.backgroundImage = toBackgroundImageValue(value)
        return true
      }

      if (field === 'link') {
        const nextLink = String(value ?? '').trim()
        cell.settings.link = nextLink || undefined
        return true
      }

      if (field === 'hiddenOnMobile') {
        cell.settings.hiddenOnMobile = Boolean(value)
        return true
      }

      if (field === 'borderRadius') {
        cell.settings.borderRadius = toNonNegativeFiniteNumber(value)
        return true
      }

      return false
    }

    return false
  }

  function updateV2AtomToolById(id: string, key: 'value' | 'label', value: unknown) {
    if (key !== 'value')
      return false

    const atom = selection.selectedAtom.value
    if (!atom)
      return false

    const [scope, atomId, ...fieldParts] = id.split('::')
    const field = fieldParts.join('::')

    if (scope !== 'v2-atom' || atomId !== atom.id || !field)
      return false

    if (field === 'hiddenOnMobile') {
      atom.hiddenOnMobile = Boolean(value)
      return true
    }

    if (atom.type === 'text') {
      if (field === 'content') {
        atom.value = String(value ?? '')
        return true
      }

      if (field === 'color') {
        atom.color = String(value ?? '')
        return true
      }

      if (field === 'spacing') {
        atom.spacing = toSpacingValue(value)
        return true
      }

      return false
    }

    if (atom.type === 'button') {
      if (field === 'text') {
        atom.text = String(value ?? '')
        return true
      }

      if (field === 'link') {
        atom.link = String(value ?? '')
        return true
      }

      if (field === 'backgroundColor') {
        atom.backgroundColor = String(value ?? '')
        return true
      }

      if (field === 'color') {
        atom.color = String(value ?? '')
        return true
      }

      if (field === 'fontSize') {
        atom.fontSize = Number(value) || 14
        return true
      }

      if (field === 'borderRadius') {
        atom.borderRadius = Number(value) || 0
        return true
      }

      if (field === 'spacing' || field === 'padding') {
        const spacingValue = toSpacingValue(value)
        atom.spacing = spacingValue

        if (spacingValue.padding && spacingValue.padding.length === 4) {
          atom.padding = spacingValue.padding.map(i => Number(i) || 0) as [
            number,
            number,
            number,
            number,
          ]
        }
        return true
      }

      return false
    }

    if (atom.type === 'divider') {
      if (field === 'color') {
        atom.color = String(value ?? '')
        return true
      }

      if (field === 'height') {
        atom.height = Number(value) || 1
        return true
      }

      if (field === 'spacing') {
        atom.spacing = toSpacingValue(value)
        return true
      }

      return false
    }

    if (atom.type === 'image') {
      if (field === 'image') {
        const next = toImageValue(value)
        atom.src = next.src
        atom.alt = next.alt || ''
        atom.link = next.link || ''
        atom.width = next.width
        atom.height = next.height
        return true
      }

      if (field === 'borderRadius') {
        atom.borderRadius = toNonNegativeFiniteNumber(value)
        return true
      }

      if (field === 'spacing') {
        atom.spacing = toSpacingValue(value)
        return true
      }

      return false
    }

    if (atom.type === 'menu') {
      if (field === 'menuItemType') {
        const nextType = value === 'image' ? 'image' : 'text'
        atom.itemType = nextType

        atom.items = atom.items.map((item) => {
          return nextType === 'image' ? toMenuImageItem(item) : toMenuTextItem(item)
        })

        if (!atom.items.length) {
          atom.items.push(
            nextType === 'image' ? { ...DEFAULT_MENU_IMAGE_ITEM } : { ...DEFAULT_MENU_TEXT_ITEM },
          )
        }

        return true
      }

      if (field === 'gap') {
        atom.gap = toNonNegativeFiniteNumber(value) ?? DEFAULT_MENU_ATOM_GAP
        return true
      }

      if (field === 'spacing') {
        atom.spacing = toSpacingValue(value)
        return true
      }

      const parsed = parseMenuListField(field)
      if (!parsed)
        return false

      const item = atom.items[parsed.index]
      if (!item)
        return false

      const itemType = getMenuAtomItemType(atom)
      if (itemType === 'image') {
        const imageItem = item.type === 'image' ? item : toMenuImageItem(item)

        if (item.type !== 'image')
          atom.items[parsed.index] = imageItem

        if (parsed.itemField === 'name') {
          imageItem.name = String(value ?? '')
          return true
        }

        if (parsed.itemField === 'link') {
          imageItem.link = String(value ?? '')
          return true
        }

        if (parsed.itemField === 'url') {
          imageItem.url = String(value ?? '')
          return true
        }

        if (parsed.itemField === 'width') {
          imageItem.width = toOptionalPositiveNumber(value)
          return true
        }

        if (parsed.itemField === 'height') {
          imageItem.height = toOptionalPositiveNumber(value)
          return true
        }

        if (parsed.itemField === 'alt') {
          imageItem.alt = String(value ?? '')
          return true
        }

        return false
      }

      const textItem = item.type === 'text' ? item : toMenuTextItem(item)
      if (item.type !== 'text')
        atom.items[parsed.index] = textItem

      if (parsed.itemField === 'text') {
        textItem.text = String(value ?? '')
        return true
      }

      if (parsed.itemField === 'link') {
        textItem.link = String(value ?? '')
        return true
      }

      if (parsed.itemField === 'color') {
        textItem.color = String(value ?? '')
        return true
      }

      if (parsed.itemField === 'fontSize') {
        textItem.fontSize = Number(value) || 16
        return true
      }

      return true
    }

    return false
  }

  function updateToolById<T extends Tool>(id: string, key: 'value' | 'label', value: T['value']) {
    if (id === 'layoutPadding' && key === 'value') {
      general.padding = (value as { padding: GeneralTool['padding'] }).padding
      return
    }

    updateV2SettingsToolById(id, key, value)
    updateV2AtomToolById(id, key, value)
  }

  function addNewToolToMultiTool(id: string) {
    const [scope, atomId, field] = id.split('::')
    if (scope === 'v2-atom' && field === 'menuList') {
      const atom = selection.selectedAtom.value
      if (!atom || atom.id !== atomId || atom.type !== 'menu')
        return

      const itemType = getMenuAtomItemType(atom)
      const lastItem = atom.items[atom.items.length - 1]
      if (itemType === 'image') {
        atom.items.push(
          lastItem?.type === 'image' ? { ...lastItem } : { ...DEFAULT_MENU_IMAGE_ITEM },
        )
      }
      else {
        atom.items.push(lastItem?.type === 'text' ? { ...lastItem } : { ...DEFAULT_MENU_TEXT_ITEM })
      }
    }
  }

  function deleteMultiToolItem(id: string, index: number) {
    const [scope, atomId, field] = id.split('::')
    if (scope === 'v2-atom' && field === 'menuList') {
      const atom = selection.selectedAtom.value
      if (!atom || atom.id !== atomId || atom.type !== 'menu')
        return

      if (atom.items.length <= 1)
        return

      atom.items.splice(index, 1)
    }
  }

  return {
    updateToolById,
    addNewToolToMultiTool,
    deleteMultiToolItem,
    updateV2SettingsToolById,
    updateV2AtomToolById,
  }
}

export function useCanvasTools() {
  if (!_instance)
    _instance = _createCanvasTools()

  return _instance
}
