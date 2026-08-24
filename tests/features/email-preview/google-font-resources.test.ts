import { describe, expect, it } from 'vitest'
import { createBlockNode } from '@/entities/block'
import {
  extractFontFamilyStacksFromHtml,
  getTemplateGoogleFontsCssUrls,
} from '@/features/email-preview/lib/google-font-resources'

describe('google font resources', () => {
  it('extracts quoted font stacks from sanitized inline HTML', () => {
    expect(
      extractFontFamilyStacksFromHtml(
        '<p style="color:#111"><span style="font-family: &quot;Roboto Slab&quot;, Georgia, serif; font-size:16px">Text</span></p>',
      ),
    ).toEqual(['"Roboto Slab", Georgia, serif'])
  })

  it('collects unique global and nested inline Google Fonts', () => {
    const block = createBlockNode('Fonts')
    const atom = block.rows[0]!.cells[0]!.children[0]!
    if (atom.type !== 'text')
      throw new Error('Expected a text atom fixture')

    atom.value = [
      '<span style="font-family: &quot;Roboto Slab&quot;, Georgia, serif;">One</span>',
      '<span style="font-family: &quot;Roboto Slab&quot;, Georgia, serif;">Two</span>',
    ].join('')

    const components = [{ id: 'font-block', version: 1 as const, block }]
    const urls = getTemplateGoogleFontsCssUrls(components, '"Inter", Arial, Helvetica, sans-serif')

    expect(urls).toHaveLength(2)
    expect(urls.some(url => url.includes('family=Inter:'))).toBe(true)
    expect(urls.some(url => url.includes('family=Roboto+Slab:'))).toBe(true)
  })
})
