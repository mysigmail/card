import Blockquote from '@tiptap/extension-blockquote'
import Bold from '@tiptap/extension-bold'
import BulletList from '@tiptap/extension-bullet-list'
import Code from '@tiptap/extension-code'
import Color from '@tiptap/extension-color'
import Document from '@tiptap/extension-document'
import FontFamily from '@tiptap/extension-font-family'
import HardBreak from '@tiptap/extension-hard-break'
import Heading from '@tiptap/extension-heading'
import History from '@tiptap/extension-history'
import HorizontalRule from '@tiptap/extension-horizontal-rule'
import Italic from '@tiptap/extension-italic'
import Link from '@tiptap/extension-link'
import ListItem from '@tiptap/extension-list-item'
import OrderedList from '@tiptap/extension-ordered-list'
import Paragraph from '@tiptap/extension-paragraph'
import Subscript from '@tiptap/extension-subscript'
import Superscript from '@tiptap/extension-superscript'
import Text from '@tiptap/extension-text'
import TextAlign from '@tiptap/extension-text-align'
import TextStyle from '@tiptap/extension-text-style'
import Underline from '@tiptap/extension-underline'
import { FontSize } from './extensions/font-size'
import { LegacyDiv, LegacyInlineDiv } from './extensions/legacy-div'
import { Strike } from './extensions/strike'
import { Typography } from './extensions/typography'

export type InlineEditorProfile = 'text' | 'button'

export const INLINE_TEXT_FONT_FAMILIES = [
  { label: 'Default', value: '' },
  { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
  { label: 'Georgia', value: 'Georgia, "Times New Roman", serif' },
  { label: 'Courier New', value: '"Courier New", Courier, monospace' },
  { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
  { label: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' },
  { label: 'Trebuchet MS', value: '"Trebuchet MS", Arial, sans-serif' },
  {
    label: 'System UI',
    value: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
] as const

const LEGACY_DIV_BLOCK_TAGS = new Set([
  'BLOCKQUOTE',
  'DIV',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'HR',
  'OL',
  'P',
  'UL',
])

function isBlockElement(node: ChildNode) {
  return node instanceof HTMLElement && LEGACY_DIV_BLOCK_TAGS.has(node.tagName)
}

function normalizeMixedDiv(div: HTMLDivElement) {
  const children = Array.from(div.childNodes)
  const hasBlockChild = children.some(isBlockElement)
  const hasInlineContent = children.some(
    node =>
      !isBlockElement(node)
      && (node.nodeType !== Node.TEXT_NODE || Boolean(node.textContent?.trim())),
  )
  if (!hasBlockChild || !hasInlineContent)
    return

  let inlineRun: ChildNode[] = []

  function flushInlineRun(before: ChildNode | null) {
    if (!inlineRun.length)
      return

    const hasContent = inlineRun.some(
      node => node.nodeType !== Node.TEXT_NODE || Boolean(node.textContent?.trim()),
    )
    if (hasContent) {
      const paragraph = div.ownerDocument.createElement('p')
      div.insertBefore(paragraph, before)
      inlineRun.forEach(node => paragraph.appendChild(node))
    }
    else {
      inlineRun.forEach(node => node.remove())
    }

    inlineRun = []
  }

  children.forEach((node) => {
    if (isBlockElement(node)) {
      flushInlineRun(node)
      return
    }

    inlineRun.push(node)
  })
  flushInlineRun(null)
}

export function normalizeInlineEditorHtml(value: string) {
  if (typeof document === 'undefined')
    return value

  const template = document.createElement('template')
  template.innerHTML = value
  Array.from(template.content.querySelectorAll<HTMLDivElement>('div'))
    .reverse()
    .forEach(normalizeMixedDiv)

  return template.innerHTML
}

export function createInlineTextExtensions() {
  return [
    Bold,
    Blockquote,
    BulletList,
    Code,
    Color.configure({ types: ['textStyle'] }),
    Document,
    FontFamily.configure({ types: ['textStyle'] }),
    FontSize,
    HardBreak,
    Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
    History.configure({ newGroupDelay: 300 }),
    HorizontalRule,
    Italic,
    LegacyDiv,
    LegacyInlineDiv,
    Link.configure({
      autolink: false,
      openOnClick: false,
      protocols: ['mailto', 'tel'],
    }),
    ListItem,
    OrderedList,
    Paragraph,
    Strike,
    Subscript,
    Superscript,
    Text,
    TextAlign.configure({ types: ['paragraph', 'heading', 'legacyDiv', 'legacyInlineDiv'] }),
    TextStyle,
    Typography,
    Underline,
  ]
}

const InlineButtonDocument = Document.extend({
  content: 'inline*',
})

export function createInlineButtonExtensions() {
  return [
    Bold,
    Code,
    Color.configure({ types: ['textStyle'] }),
    InlineButtonDocument,
    FontFamily.configure({ types: ['textStyle'] }),
    FontSize,
    History.configure({ newGroupDelay: 300 }),
    Italic,
    Strike,
    Subscript,
    Superscript,
    Text,
    TextStyle,
    Typography,
    Underline,
  ]
}
