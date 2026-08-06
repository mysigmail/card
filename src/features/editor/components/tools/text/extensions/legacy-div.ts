import { Node } from '@tiptap/vue-3'

const BLOCK_CHILD_SELECTOR
  = ':scope > p, :scope > h1, :scope > h2, :scope > h3, :scope > h4, :scope > h5, :scope > h6, :scope > blockquote, :scope > div, :scope > ul, :scope > ol, :scope > hr'

function hasBlockChildren(element: HTMLElement) {
  return Boolean(element.querySelector(BLOCK_CHILD_SELECTOR))
}

export const LegacyDiv = Node.create({
  name: 'legacyDiv',
  group: 'block',
  content: 'block+',
  defining: true,

  parseHTML() {
    return [
      {
        tag: 'div',
        getAttrs: node => (node instanceof HTMLElement && hasBlockChildren(node) ? {} : false),
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', HTMLAttributes, 0]
  },
})

export const LegacyInlineDiv = Node.create({
  name: 'legacyInlineDiv',
  group: 'block',
  content: 'inline*',
  defining: true,

  parseHTML() {
    return [
      {
        tag: 'div',
        getAttrs: node => (node instanceof HTMLElement && !hasBlockChildren(node) ? {} : false),
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', HTMLAttributes, 0]
  },
})
