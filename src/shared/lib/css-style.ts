export function splitCssDeclarations(style: string) {
  const declarations: string[] = []
  let start = 0
  let quote = ''
  let parentheses = 0

  for (let index = 0; index < style.length; index += 1) {
    const character = style[index]!
    if (quote) {
      if (character === quote && style[index - 1] !== '\\')
        quote = ''
      continue
    }
    if (character === '"' || character === '\'') {
      quote = character
      continue
    }
    if (character === '(') {
      parentheses += 1
      continue
    }
    if (character === ')') {
      parentheses = Math.max(0, parentheses - 1)
      continue
    }
    if (character === ';' && parentheses === 0) {
      const declaration = style.slice(start, index).trim()
      if (declaration)
        declarations.push(declaration)
      start = index + 1
    }
  }

  const finalDeclaration = style.slice(start).trim()
  if (finalDeclaration)
    declarations.push(finalDeclaration)
  return declarations
}

export function splitCssProperty(declaration: string) {
  const separator = declaration.indexOf(':')
  if (separator <= 0)
    return undefined
  return {
    property: declaration.slice(0, separator).trim(),
    value: declaration.slice(separator + 1).trim(),
  }
}
