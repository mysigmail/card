import type { CSSProperties } from 'vue'
import type { CellNode, TextAtom } from '@/entities/block'
import { hasPositiveBorderRadius, resolveBorderRadiusStyle } from '@/entities/style'
import { sanitizeTextEditorHtml } from '@/entities/template'
import { resolveBorderStyle } from './resolve-border-style'

const DEFAULT_TEXT_WIDTH_MODE = 'fill'

function tupleToCss(value?: [number, number, number, number]) {
  return value ? `${value[0]}px ${value[1]}px ${value[2]}px ${value[3]}px` : undefined
}

export function isTextBoxEnabled(atom: TextAtom) {
  return (
    atom.widthMode !== undefined
    || atom.paragraphSpacing !== undefined
    || atom.borderRadius !== undefined
    || atom.border !== undefined
  )
}

export function resolveTextBoxRootStyle(atom: TextAtom): CSSProperties {
  const margin = tupleToCss(atom.spacing?.margin)
  const padding = isTextBoxEnabled(atom) ? undefined : tupleToCss(atom.spacing?.padding)
  return {
    ...(margin ? { margin } : {}),
    ...(padding ? { padding } : {}),
  }
}

export function resolveTextBoxTableStyle(
  atom: TextAtom,
  horizontalAlign: CellNode['settings']['horizontalAlign'] = 'left',
): CSSProperties {
  const widthMode = atom.widthMode ?? DEFAULT_TEXT_WIDTH_MODE
  const style: CSSProperties = {
    width: widthMode === 'fill' ? '100%' : 'auto',
    maxWidth: '100%',
    tableLayout: 'auto',
    borderCollapse: 'separate',
    borderSpacing: '0',
  }

  if (widthMode === 'hug') {
    style.marginLeft = horizontalAlign === 'center' || horizontalAlign === 'right' ? 'auto' : '0'
    style.marginRight = horizontalAlign === 'center' ? 'auto' : '0'
  }

  return style
}

export function resolveTextBoxCellStyle(atom: TextAtom): CSSProperties {
  const padding = tupleToCss(atom.spacing?.padding)
  return {
    ...(padding ? { padding } : {}),
    borderRadius: resolveBorderRadiusStyle(atom.borderRadius),
    overflow: hasPositiveBorderRadius(atom.borderRadius) ? 'hidden' : undefined,
    ...resolveBorderStyle(atom.border),
  }
}

function appendDefaultMarginReset(openingTag: string) {
  const styleMatch = openingTag.match(/\sstyle="([^"]*)"/i)
  if (!styleMatch)
    return openingTag.replace(/>$/, ' style="margin:0">')

  if (/\bmargin(?:-(?:top|bottom))?\s*:/i.test(styleMatch[1] || ''))
    return openingTag

  const currentStyle = styleMatch[1]?.trim() || ''
  const separator = currentStyle && !currentStyle.endsWith(';') ? ';' : ''
  return openingTag.replace(styleMatch[0], ` style="${currentStyle}${separator}margin:0"`)
}

export function renderTextBoxHtml(value: string, paragraphSpacing = 0) {
  const sanitized = sanitizeTextEditorHtml(value)
  const withNormalizedBlocks = sanitized.replace(
    /<(?:p|h[1-6]|blockquote|ul|ol|hr)(?:\s[^>]*)?>/gi,
    appendDefaultMarginReset,
  )
  const spacing = Number.isFinite(paragraphSpacing) ? Math.max(0, paragraphSpacing) : 0
  if (spacing === 0)
    return withNormalizedBlocks

  const spacer = `<div style="height:${spacing}px;line-height:${spacing}px;font-size:0">&nbsp;</div>`
  return withNormalizedBlocks.replace(/<\/p>(\s*)<p\b/gi, `</p>$1${spacer}<p`)
}

export function renderTextAtomHtml(atom: TextAtom) {
  return isTextBoxEnabled(atom)
    ? renderTextBoxHtml(atom.value, atom.paragraphSpacing)
    : sanitizeTextEditorHtml(atom.value)
}
