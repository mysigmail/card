import type { GridTool, MultiTool, SingleTool } from '@/types/editor'
import type { ToolBuilderConfig } from '@/types/email-components'
import { nanoid } from 'nanoid'

export function toolBuilder<T extends SingleTool | MultiTool | GridTool>(
  config: ToolBuilderConfig<T>,
): T {
  const { group, key, label, name, type, value, options } = config

  return {
    id: nanoid(8),
    key,
    label,
    groupId: group?.id,
    groupRole: group?.role,
    groupLabel: group?.label,
    name,
    type,
    ...(options ? { options } : {}),
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
    cursor: 'grabbing',
  } as HTMLElement['style']

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
