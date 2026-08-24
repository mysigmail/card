// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick } from 'vue'
import { createGoogleFontStack, googleFontFamilies } from '@/entities/font'
import GeneralFontSettings from '@/features/editor/components/tools/GeneralFontSettings.vue'
import { useCanvas } from '@/features/editor/model'

async function flushUi() {
  await nextTick()
  await new Promise(resolve => setTimeout(resolve, 0))
  await nextTick()
}

describe('general font settings keyboard flow', () => {
  beforeEach(() => {
    vi.spyOn(window, 'scrollTo').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
    document.body.innerHTML = ''
    Reflect.deleteProperty(Element.prototype, 'scrollIntoView')
  })

  it('refreshes dynamic search results and selects them with the keyboard', async () => {
    const canvas = useCanvas()
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      configurable: true,
      value() {},
    })
    canvas.general.font = 'Arial, Helvetica, sans-serif'
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp(GeneralFontSettings)
    app.mount(host)

    const trigger = host.querySelector<HTMLButtonElement>('[role="combobox"]')!
    trigger.click()
    await flushUi()

    const currentFont = document.body.querySelector<HTMLElement>('[data-current-font]')!
    expect(currentFont.textContent).toContain('Arial')
    expect(currentFont.getAttribute('aria-current')).toBe('true')
    expect(currentFont.querySelector('svg')?.classList.contains('opacity-0')).toBe(false)
    expect(document.body.textContent).not.toContain('Default font')

    const input = document.body.querySelector<HTMLInputElement>('[data-slot="command-input"]')!
    input.value = 'Inter Tight'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await flushUi()

    expect(document.body.querySelector('[role="option"]')).not.toBeNull()

    input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowUp' }))
    input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowDown' }))
    input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }))
    await flushUi()

    expect(canvas.general.font).toBe('"Inter Tight", Arial, Helvetica, sans-serif')
    expect(document.body.querySelector('[role="listbox"]')).toBeNull()

    trigger.click()
    await flushUi()
    const reopenedInput = document.body.querySelector<HTMLInputElement>(
      '[data-slot="command-input"]',
    )!
    reopenedInput.value = 'Montserrat'
    reopenedInput.dispatchEvent(new Event('input', { bubbles: true }))
    await flushUi()

    expect(document.body.textContent).toContain('Montserrat')
    expect(document.body.textContent).not.toContain('No fonts found')

    reopenedInput.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }))
    await flushUi()

    expect(canvas.general.font).toBe('"Montserrat", Arial, Helvetica, sans-serif')
    expect(document.body.querySelector('[role="listbox"]')).toBeNull()

    trigger.click()
    await flushUi()
    document.body
      .querySelector<HTMLInputElement>('[data-slot="command-input"]')!
      .dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Escape' }))
    await flushUi()
    expect(document.body.querySelector('[role="listbox"]')).toBeNull()
    app.unmount()
  })

  it('keeps the complete Google Fonts result set keyboard-accessible', async () => {
    const canvas = useCanvas()
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      configurable: true,
      value() {},
    })
    canvas.general.font = 'Arial, Helvetica, sans-serif'
    const lastMatchingFont = googleFontFamilies
      .filter((font) => {
        return font.family.toLocaleLowerCase().includes('a')
      })
      .at(-1)!
    const host = document.createElement('div')
    document.body.append(host)
    const app = createApp(GeneralFontSettings)
    app.mount(host)

    host.querySelector<HTMLButtonElement>('[role="combobox"]')!.click()
    await flushUi()
    const input = document.body.querySelector<HTMLInputElement>('[data-slot="command-input"]')!
    input.value = 'a'
    input.dispatchEvent(new Event('input', { bubbles: true }))
    await flushUi()

    input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'ArrowUp' }))
    input.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'Enter' }))
    await flushUi()

    expect(canvas.general.font).toBe(createGoogleFontStack(lastMatchingFont))
    app.unmount()
  })
})
