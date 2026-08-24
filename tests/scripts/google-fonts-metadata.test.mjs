import { describe, expect, it } from 'vitest'
import {
  createGoogleFontsCssUrl,
  filterSupportedGoogleFonts,
} from '../../scripts/lib/google-fonts-css-validation.mjs'
import {
  createGoogleFontsSnapshot,
  normalizeGoogleFontMetadata,
  parseTextproto,
} from '../../scripts/lib/google-fonts-metadata.mjs'

const FIXTURE = `
name: "Example Sans"
license: "OFL"
category: "SANS_SERIF"
fonts { style: "normal" weight: 400 filename: "ExampleSans[wght].ttf" }
fonts { style: "italic" weight: 400 filename: "ExampleSans-Italic[wght].ttf" }
subsets: "latin"
subsets: "cyrillic"
axes { tag: "wght" min_value: 100.0 max_value: 900.0 }
sample_text { specimen_16: "first line\\n" "second line" }
`

describe('google Fonts METADATA.pb parser', () => {
  it('parses nested, repeated and adjacent textproto values', () => {
    const parsed = parseTextproto(FIXTURE)

    expect(parsed.fonts).toHaveLength(2)
    expect(parsed.subsets).toEqual(['latin', 'cyrillic'])
    expect(parsed.sample_text.specimen_16).toBe('first line\nsecond line')
  })

  it('normalizes static styles and variable weight ranges', () => {
    expect(normalizeGoogleFontMetadata(parseTextproto(FIXTURE))).toEqual({
      family: 'Example Sans',
      category: 'sans-serif',
      license: 'OFL',
      subsets: ['cyrillic', 'latin'],
      variants: [
        { style: 'italic', weights: [400], weightRange: [100, 900] },
        { style: 'normal', weights: [400], weightRange: [100, 900] },
      ],
    })
  })

  it('creates a deterministic family order and records the source commit', () => {
    const first = parseTextproto(FIXTURE)
    const second = { ...first, name: 'A Font' }
    const snapshot = createGoogleFontsSnapshot([first, second], 'abc123')

    expect(snapshot.sourceCommit).toBe('abc123')
    expect(snapshot.families.map(font => font.family)).toEqual(['A Font', 'Example Sans'])
  })
})

describe('google Fonts CSS2 validation gate', () => {
  const variants = [{ style: 'normal', weights: [400] }]

  it('checks exact generated URLs concurrently and preserves source order', async () => {
    const fonts = [
      { family: 'Supported A', variants },
      { family: 'Unsupported', variants },
      { family: 'Supported B', variants },
    ]
    const checkedUrls = []
    const result = await filterSupportedGoogleFonts(fonts, async (font, url) => {
      checkedUrls.push(url)
      return { ok: font.family !== 'Unsupported', status: font.family === 'Unsupported' ? 400 : 200 }
    }, { concurrency: 2 })

    expect(result.supported.map(font => font.family)).toEqual(['Supported A', 'Supported B'])
    expect(result.excluded).toEqual([{ family: 'Unsupported', status: 400 }])
    expect(checkedUrls).toContain(createGoogleFontsCssUrl(fonts[0]))
  })
})
