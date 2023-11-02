import { nanoid } from 'nanoid'
import type { MultiTool, SingleTool } from '@/types/editor'
import type { ToolBuilderConfig } from '@/types/email-components'

export function toolBuilder<T extends SingleTool | MultiTool>(config: ToolBuilderConfig<T>): T {
  const { group, label, name, type, value } = config
  return {
    id: nanoid(8),
    label,
    group,
    name,
    type,
    value,
  } as T
}

export function addGhost(dataTransfer: DragEvent['dataTransfer'], name: string) {
  const el = document.createElement('div')
  const style = {
    padding: '0 20px',
    height: '50px',
    backgroundColor: 'royalblue',
    borderRadius: '3px',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'fixed',
    top: '99%', // фикс отображения в safari
  }

  el.id = 'ghost'
  el.innerHTML = name

  Object.assign(el.style, style)
  document.body.appendChild(el)

  dataTransfer!.setDragImage(el, 0, 0)
}

export function removeGhost() {
  const el = document.querySelector('#ghost')
  if (el)
    el.remove()
}
