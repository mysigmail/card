import type { Ref } from 'vue'
import { onBeforeUnmount, watch } from 'vue'

const GOOGLE_FONT_LINK_ATTRIBUTE = 'data-card-google-font'

export function useGoogleFontStylesheets(urls: Readonly<Ref<readonly string[]>>) {
  const links = new Map<string, HTMLLinkElement>()

  function removeLink(url: string) {
    links.get(url)?.remove()
    links.delete(url)
  }

  watch(
    urls,
    (nextUrls) => {
      const nextUrlSet = new Set(nextUrls)

      links.forEach((_, url) => {
        if (!nextUrlSet.has(url))
          removeLink(url)
      })

      nextUrlSet.forEach((url) => {
        if (links.has(url))
          return

        const link = document.createElement('link')
        link.rel = 'stylesheet'
        link.href = url
        link.setAttribute(GOOGLE_FONT_LINK_ATTRIBUTE, '')
        document.head.append(link)
        links.set(url, link)
      })
    },
    { immediate: true },
  )

  onBeforeUnmount(() => {
    links.forEach(link => link.remove())
    links.clear()
  })
}
