import type { GeneralTool, Tool } from './types'
import type { RowNode, TextAtom } from '@/entities/block'
import { sanitizeTextEditorHtml } from '@/entities/template'
import { findCanvasBlockInstance, findCellById, findRowById } from './lib/canvas-state-utils'
import { general, installed } from './state'
import {
  toBackgroundImageValue,
  toImageValue,
  toNonNegativeFiniteNumber,
  toOptionalPositiveNumber,
  toSpacingValue,
} from './tools'
import { useSelection } from './use-selection'

let _instance: ReturnType<typeof _createCanvasTools> | null = null

function _createCanvasTools() {
  const selection = useSelection()

  function findTextAtomById(atomId: string) {
    let target: TextAtom | undefined

    function visitRows(rows: RowNode[]): TextAtom | undefined {
      for (const row of rows) {
        for (const cell of row.cells) {
          const atom = cell.children.find(
            (candidate): candidate is TextAtom =>
              candidate.id === atomId && candidate.type === 'text',
          )
          if (atom)
            return atom

          const nested = visitRows(cell.children.filter(child => child.type === 'row'))
          if (nested)
            return nested
        }
      }
    }

    for (const component of installed.value) {
      if (component.version !== 1)
        continue
      target = visitRows(component.block.rows)
      if (target)
        return target
    }
  }

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

      if (field === 'widthMode') {
        row.settings.widthMode = value === 'hug' ? 'hug' : 'fill'
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
      if (field === 'content')
        return updateTextAtomValue(atom.id, String(value ?? ''))

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
    void id
  }

  function deleteMultiToolItem(id: string, index: number) {
    void id
    void index
  }

  function updateTextAtomValue(atomId: string, html: string) {
    const target = findTextAtomById(atomId)

    if (!target)
      return false

    const value = sanitizeTextEditorHtml(html)
    if (target.value !== value)
      target.value = value

    return true
  }

  return {
    updateToolById,
    addNewToolToMultiTool,
    deleteMultiToolItem,
    updateV2SettingsToolById,
    updateV2AtomToolById,
    updateTextAtomValue,
    getTextAtomValue: (atomId: string) => findTextAtomById(atomId)?.value,
  }
}

export function useCanvasTools() {
  if (!_instance)
    _instance = _createCanvasTools()

  return _instance
}
