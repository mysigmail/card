export function addGhost(
  dataTransfer: DragEvent['dataTransfer'],
  name: string,
  size: 'default' | 'sm' = 'default',
) {
  document.querySelectorAll('#ghost').forEach(el => el.remove())

  const el = document.createElement('div')
  const isSmall = size === 'sm'

  const style = {
    padding: isSmall ? '0 10px' : '0 20px',
    height: isSmall ? '32px' : '50px',
    backgroundColor: 'oklch(0.488 0.243 264.376)', // primary color
    borderRadius: '3px',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'fixed',
    top: '0',
    left: '-9999px',
    cursor: 'grabbing',
    pointerEvents: 'none',
    fontSize: isSmall ? '12px' : '14px',
    zIndex: '9999',
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
