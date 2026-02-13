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
