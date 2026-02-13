import type { Component } from 'vue'
import VueEmail from '@mysigmail/vue-email-components'
import { createApp } from 'vue'

import previewStyles from '@/shared/assets/css/preview.css?inline'

const style = document.createElement('style')
style.textContent = previewStyles

export function renderToShadowDom(el: HTMLDivElement, component: Component) {
  const shadow = el.attachShadow({ mode: 'open' })
  const mount = document.createElement('div')

  mount.style.height = '100%'

  shadow.appendChild(mount)
  shadow.appendChild(style)

  shadow.addEventListener('click', e => e.stopPropagation())
  shadow.addEventListener('click', e => e.preventDefault())

  createApp(component).use(VueEmail).mount(mount)
  return shadow
}
