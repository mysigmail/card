import type { Ref } from 'vue'
import Sortable from 'sortablejs'
import { addGhost, removeGhost } from '@/features/email-preview'

interface CreateTreeSortableOptions {
  el: HTMLElement
  draggable: string
  handle: string
  ghostClass: string
  isDragging: Ref<boolean>
  onMove: (oldIndex: number, newIndex: number) => void
  getDragName?: (dragEl: HTMLElement) => string
}

export function createTreeSortable(options: CreateTreeSortableOptions) {
  return Sortable.create(options.el, {
    animation: 150,
    draggable: options.draggable,
    handle: options.handle,
    ghostClass: options.ghostClass,
    swapThreshold: 0.5,
    onStart() {
      options.isDragging.value = true
    },
    onEnd(e) {
      removeGhost()
      options.isDragging.value = false

      if (e.oldIndex === undefined || e.newIndex === undefined)
        return

      options.onMove(e.oldIndex, e.newIndex)
    },
    setData(dataTransfer, dragEl) {
      const defaultName = dragEl.getAttribute('data-name') || 'Item'
      const name = options.getDragName?.(dragEl) ?? defaultName
      addGhost(dataTransfer, name, 'sm')
    },
  })
}
