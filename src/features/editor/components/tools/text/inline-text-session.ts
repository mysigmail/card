import type { Editor } from '@tiptap/vue-3'
import { createDocument } from '@tiptap/vue-3'
import { normalizeInlineEditorHtml } from './text-editor-core'

interface InlineTextUnmountState {
  currentModelValue?: string
  finished: boolean
  lastModelValue: string
}

interface InlineTextPointerPosition {
  left: number
  top: number
}

function distanceFromCaretRect(rect: DOMRect, pointer: InlineTextPointerPosition) {
  const verticalDistance
    = pointer.top < rect.top
      ? rect.top - pointer.top
      : pointer.top > rect.bottom
        ? pointer.top - rect.bottom
        : 0

  // Prefer the clicked line before comparing the horizontal caret distance.
  return verticalDistance * 100_000 + Math.abs(pointer.left - rect.left)
}

export function textOffsetAtCoords(root: HTMLElement, pointer: InlineTextPointerPosition) {
  const document = root.ownerDocument
  const walker = document.createTreeWalker(root, 5)
  const range = document.createRange()
  let closestOffset: number | undefined
  let closestDistance = Number.POSITIVE_INFINITY
  let contentOffset = 0
  let node = walker.nextNode()

  while (node) {
    if (node.nodeType === 3) {
      const textLength = node.textContent?.length ?? 0

      for (let offset = 0; offset <= textLength; offset += 1) {
        range.setStart(node, offset)
        range.collapse(true)
        const rect = range.getBoundingClientRect()

        if (rect.height > 0) {
          const distance = distanceFromCaretRect(rect, pointer)
          if (distance < closestDistance) {
            closestDistance = distance
            closestOffset = contentOffset + offset
          }
        }
      }

      contentOffset += textLength
    }
    else if (node instanceof HTMLBRElement) {
      const rect = node.getBoundingClientRect()
      const distance = distanceFromCaretRect(rect, pointer)
      if (distance < closestDistance) {
        closestDistance = distance
        closestOffset = contentOffset
      }
      contentOffset += 1
    }

    node = walker.nextNode()
  }

  return closestOffset
}

export function textSelectionPositionAtOffset(editor: Editor, targetOffset: number) {
  let contentOffset = 0
  let lastPosition = 1
  let selectionPosition: number | undefined

  editor.state.doc.descendants((node, position) => {
    if (selectionPosition !== undefined)
      return false

    const contentSize = node.isText
      ? (node.text?.length ?? 0)
      : node.isInline && node.isLeaf
        ? node.nodeSize
        : 0

    if (contentSize === 0)
      return true

    lastPosition = position + contentSize
    if (targetOffset <= contentOffset + contentSize) {
      selectionPosition = position + Math.max(0, targetOffset - contentOffset)
      return false
    }

    contentOffset += contentSize
    return false
  })

  return selectionPosition ?? lastPosition
}

export function textSelectionPositionAtCoords(editor: Editor, pointer: InlineTextPointerPosition) {
  const { view } = editor
  const document = view.dom.ownerDocument
  const walker = document.createTreeWalker(view.dom, 4)
  const range = document.createRange()
  let closestPosition: number | undefined
  let closestDistance = Number.POSITIVE_INFINITY
  let textNode = walker.nextNode()

  while (textNode) {
    const textLength = textNode.textContent?.length ?? 0

    for (let offset = 0; offset <= textLength; offset += 1) {
      range.setStart(textNode, offset)
      range.collapse(true)
      const rect = range.getBoundingClientRect()

      if (rect.height > 0) {
        const distance = distanceFromCaretRect(rect, pointer)
        if (distance < closestDistance) {
          closestDistance = distance
          closestPosition = view.posAtDOM(textNode, offset)
        }
      }
    }

    textNode = walker.nextNode()
  }

  return closestPosition ?? view.posAtCoords(pointer)?.pos
}

export function canPersistInlineTextOnUnmount(state: InlineTextUnmountState) {
  return !state.finished && state.currentModelValue === state.lastModelValue
}

export function replaceEditorContent(editor: Editor, value: string) {
  const document = createDocument(normalizeInlineEditorHtml(value), editor.schema)
  const transaction = editor.state.tr
    .replaceWith(0, editor.state.doc.content.size, document)
    .setMeta('preventUpdate', true)
    .setMeta('addToHistory', false)

  editor.view.dispatch(transaction)

  const historyPlugin = editor.state.plugins.find((plugin) => {
    const key = (plugin as unknown as { key?: unknown }).key
    return typeof key === 'string' && key.startsWith('history$')
  })
  if (historyPlugin) {
    editor.unregisterPlugin('history')
    editor.registerPlugin(historyPlugin)
  }
}
