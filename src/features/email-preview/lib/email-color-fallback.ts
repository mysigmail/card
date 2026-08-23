import { normalizeEmailColor, resolveOpaqueEmailColor } from '@/entities/style'
import { splitCssDeclarations } from '@/shared/lib/css-style'

const STYLE_ATTRIBUTE_PATTERN = /style=(['"])(.*?)\1/gi
const RGBA_PATTERN = /rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(?:0|1|0?\.\d+)\s*\)/gi

function equivalentDeclaration(left: string | undefined, right: string) {
  return left?.replace(/\s+/g, '').toLowerCase() === right.replace(/\s+/g, '').toLowerCase()
}

export function addEmailColorFallbacksToHtml(html: string) {
  return html.replace(STYLE_ATTRIBUTE_PATTERN, (attribute, quote: string, style: string) => {
    const declarations = splitCssDeclarations(style)
    const progressive: string[] = []
    for (const declaration of declarations) {
      const colors = declaration.match(RGBA_PATTERN)
      if (!colors) {
        progressive.push(declaration)
        continue
      }
      let fallback = declaration
      for (const color of colors) {
        const normalized = normalizeEmailColor(color)
        const opaque = normalized ? resolveOpaqueEmailColor(normalized) : undefined
        if (opaque)
          fallback = fallback.replace(color, opaque)
      }
      if (fallback !== declaration && !equivalentDeclaration(progressive.at(-1), fallback))
        progressive.push(fallback)
      progressive.push(declaration)
    }
    return `style=${quote}${progressive.join(';')}${quote}`
  })
}
