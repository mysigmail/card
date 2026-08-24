// @vitest-environment jsdom
import { afterEach, describe, expect, it } from 'vitest'
import { createApp, ref } from 'vue'
import { useGoogleFontStylesheets } from '@/features/editor/ui/use-google-font-stylesheets'

const GOOGLE_FONT_LINK_SELECTOR = 'link[data-card-google-font]'

afterEach(() => {
  document.head.querySelectorAll(GOOGLE_FONT_LINK_SELECTOR).forEach(link => link.remove())
  document.body.innerHTML = ''
})

describe('google font stylesheets', () => {
  it('loads stylesheets in the document head and keeps them in sync', async () => {
    const urls = ref<readonly string[]>([
      'https://fonts.googleapis.com/css2?family=Inter&display=swap',
    ])
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp({
      setup() {
        useGoogleFontStylesheets(urls)
        return () => null
      },
    })

    app.mount(host)

    expect(document.head.querySelector<HTMLLinkElement>(GOOGLE_FONT_LINK_SELECTOR)?.href).toBe(
      urls.value[0],
    )

    urls.value = ['https://fonts.googleapis.com/css2?family=Roboto&display=swap']
    await Promise.resolve()

    const links = document.head.querySelectorAll<HTMLLinkElement>(GOOGLE_FONT_LINK_SELECTOR)
    expect(links).toHaveLength(1)
    expect(links[0]?.href).toBe(urls.value[0])

    app.unmount()
    expect(document.head.querySelector(GOOGLE_FONT_LINK_SELECTOR)).toBeNull()
  })
})
