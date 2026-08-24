import type { RowNode } from '@/entities/block'
import type { CanvasBlockInstance } from '@/entities/template'
import { getGoogleFontsCssUrlForStack } from '@/entities/font'

function decodeHtmlAttribute(value: string) {
  return value
    .replace(/&quot;|&#34;|&#x22;/gi, '"')
    .replace(/&apos;|&#39;|&#x27;/gi, '\'')
    .replace(/&amp;/gi, '&')
}

export function extractFontFamilyStacksFromHtml(html: string): string[] {
  const stacks: string[] = []

  for (const styleMatch of html.matchAll(/\sstyle\s*=\s*(["'])([\s\S]*?)\1/gi)) {
    const style = decodeHtmlAttribute(styleMatch[2] ?? '')
    for (const familyMatch of style.matchAll(/(?:^|;)\s*font-family\s*:\s*([^;]+)/gi)) {
      const stack = familyMatch[1]?.trim()
      if (stack)
        stacks.push(stack)
    }
  }

  return stacks
}

function collectRowsFontStacks(rows: RowNode[], stacks: string[]) {
  rows.forEach((row) => {
    row.cells.forEach((cell) => {
      cell.children.forEach((child) => {
        if (child.type === 'row') {
          collectRowsFontStacks([child], stacks)
          return
        }

        if (child.type === 'text' || child.type === 'button')
          stacks.push(...extractFontFamilyStacksFromHtml(child.value))
      })
    })
  })
}

export function getTemplateGoogleFontsCssUrls(
  components: CanvasBlockInstance[],
  generalFont: string,
): string[] {
  const stacks = [generalFont]
  components.forEach(component => collectRowsFontStacks(component.block.rows, stacks))

  return [
    ...new Set(
      stacks.flatMap((stack) => {
        const url = getGoogleFontsCssUrlForStack(stack)
        return url ? [url] : []
      }),
    ),
  ]
}

export function createTemplateGoogleFontsCssImports(
  components: CanvasBlockInstance[],
  generalFont: string,
): string | undefined {
  const imports = getTemplateGoogleFontsCssUrls(components, generalFont).map(
    url => `@import url("${url}");`,
  )

  return imports.length ? imports.join('\n') : undefined
}
