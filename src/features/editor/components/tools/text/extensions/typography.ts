import { Extension } from '@tiptap/vue-3'

const INLINE_TYPOGRAPHY_ATTRIBUTES = {
  fontWeight: 'font-weight',
  lineHeight: 'line-height',
  letterSpacing: 'letter-spacing',
} as const

const BLOCK_TYPOGRAPHY_ATTRIBUTES = {
  color: 'color',
  fontFamily: 'font-family',
  fontSize: 'font-size',
  textAlign: 'text-align',
  ...INLINE_TYPOGRAPHY_ATTRIBUTES,
} as const

export const Typography = Extension.create({
  name: 'typography',

  addGlobalAttributes() {
    return [
      {
        types: ['textStyle'],
        attributes: Object.fromEntries(
          Object.entries(INLINE_TYPOGRAPHY_ATTRIBUTES).map(([attribute, cssProperty]) => [
            attribute,
            {
              default: null,
              parseHTML: (element: HTMLElement) =>
                element.style.getPropertyValue(cssProperty) || null,
              renderHTML: (attributes: Record<string, unknown>) => {
                const value = attributes[attribute]
                return value ? { style: `${cssProperty}: ${value}` } : {}
              },
            },
          ]),
        ),
      },
      {
        types: [
          'paragraph',
          'heading',
          'legacyDiv',
          'legacyInlineDiv',
          'blockquote',
          'bulletList',
          'orderedList',
          'listItem',
          'code',
        ],
        attributes: Object.fromEntries(
          Object.entries(BLOCK_TYPOGRAPHY_ATTRIBUTES).map(([attribute, cssProperty]) => [
            attribute,
            {
              default: null,
              parseHTML: (element: HTMLElement) =>
                element.style.getPropertyValue(cssProperty) || null,
              renderHTML: (attributes: Record<string, unknown>) => {
                const value = attributes[attribute]
                return value ? { style: `${cssProperty}: ${value}` } : {}
              },
            },
          ]),
        ),
      },
    ]
  },
})
