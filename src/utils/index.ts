import { createApp } from 'vue'
import type { Component } from 'vue'
import VueEmail from '@mysigmail/vue-email-components'

import previewStyles from '../assets/scss/preview.scss?inline'

export const clone = <T = any>(obj: any) => JSON.parse(JSON.stringify(obj)) as T

const style = document.createElement('style')
style.textContent = previewStyles

export function renderToShadowDom(el: HTMLDivElement, component: Component) {
  const shadow = el.attachShadow({ mode: 'open' })
  const mount = document.createElement('div')

  shadow.appendChild(mount)
  shadow.appendChild(style)
  createApp(component).use(VueEmail).mount(mount)
}
