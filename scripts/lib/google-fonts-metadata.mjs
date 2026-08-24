const CATEGORY_MAP = {
  DISPLAY: 'display',
  HANDWRITING: 'handwriting',
  MONOSPACE: 'monospace',
  SANS_SERIF: 'sans-serif',
  SERIF: 'serif',
}

function tokenizeTextproto(source) {
  const tokens = []
  let index = 0

  while (index < source.length) {
    const char = source[index]

    if (/\s/.test(char)) {
      index += 1
      continue
    }

    if (char === '#') {
      while (index < source.length && source[index] !== '\n')
        index += 1
      continue
    }

    if ('{}:[],<>;'.includes(char)) {
      tokens.push({ type: 'punctuation', value: char })
      index += 1
      continue
    }

    if (char === '"' || char === '\'') {
      const quote = char
      let value = ''
      index += 1
      while (index < source.length && source[index] !== quote) {
        if (source[index] === '\\') {
          index += 1
          const escaped = source[index]
          const escapes = { n: '\n', r: '\r', t: '\t' }
          value += escapes[escaped] ?? escaped
        }
        else {
          value += source[index]
        }
        index += 1
      }
      if (source[index] !== quote)
        throw new Error('Unterminated textproto string')
      index += 1
      tokens.push({ type: 'string', value })
      continue
    }

    const start = index
    while (index < source.length && !/[\s{}:[\],<>;#]/.test(source[index]))
      index += 1
    if (start === index)
      throw new Error(`Unexpected textproto character at ${index}`)
    const value = source.slice(start, index)
    tokens.push({ type: /^-?\d+(?:\.\d+)?$/.test(value) ? 'number' : 'identifier', value })
  }

  return tokens
}

function addField(message, key, value) {
  if (!(key in message)) {
    message[key] = value
    return
  }
  message[key] = Array.isArray(message[key]) ? [...message[key], value] : [message[key], value]
}

export function parseTextproto(source) {
  const tokens = tokenizeTextproto(source)
  let index = 0

  function parseScalar() {
    const token = tokens[index]
    if (!token)
      throw new Error('Expected textproto value')
    if (token.value === '[') {
      index += 1
      const values = []
      while (tokens[index]?.value !== ']') {
        values.push(parseScalar())
        if (tokens[index]?.value === ',')
          index += 1
      }
      index += 1
      return values
    }
    index += 1
    if (token.type === 'number')
      return Number(token.value)
    if (token.type === 'identifier') {
      if (token.value === 'true' || token.value === 'false')
        return token.value === 'true'
      return token.value
    }
    if (token.type === 'string') {
      let value = token.value
      while (tokens[index]?.type === 'string') {
        value += tokens[index].value
        index += 1
      }
      return value
    }
    throw new Error(`Unexpected textproto token: ${token.value}`)
  }

  function parseMessage(closingToken) {
    const message = {}
    while (index < tokens.length) {
      if (closingToken && tokens[index]?.value === closingToken) {
        index += 1
        return message
      }

      const key = tokens[index]
      if (!key || key.type !== 'identifier')
        throw new Error(`Expected textproto field at token ${index}`)
      index += 1

      const separator = tokens[index]?.value
      if (separator === ':') {
        index += 1
        addField(message, key.value, parseScalar())
      }
      else if (separator === '{' || separator === '<') {
        index += 1
        addField(message, key.value, parseMessage(separator === '{' ? '}' : '>'))
      }
      else {
        throw new Error(`Expected ':' or message after ${key.value}`)
      }

      if (tokens[index]?.value === ',' || tokens[index]?.value === ';')
        index += 1
    }

    if (closingToken)
      throw new Error(`Expected closing ${closingToken}`)
    return message
  }

  return parseMessage()
}

function arrayOf(value) {
  if (value === undefined)
    return []
  return Array.isArray(value) ? value : [value]
}

function normalizeStyle(value) {
  return String(value).toLowerCase() === 'italic' ? 'italic' : 'normal'
}

export function normalizeGoogleFontMetadata(metadata) {
  const family = typeof metadata.name === 'string' ? metadata.name.trim() : ''
  if (!family)
    throw new Error('Google Fonts metadata has no family name')

  const category = CATEGORY_MAP[String(metadata.category)] ?? 'sans-serif'
  const fonts = arrayOf(metadata.fonts)
  const axes = arrayOf(metadata.axes)
  const weightAxis = axes.find(axis => axis?.tag === 'wght')
  const hasItalicAxis = axes.some(axis => axis?.tag === 'ital')
  const weightRange = weightAxis
    ? [Number(weightAxis.min_value), Number(weightAxis.max_value)]
    : undefined
  const styles = new Set(fonts.map(font => normalizeStyle(font?.style)))
  if (hasItalicAxis) {
    styles.add('normal')
    styles.add('italic')
  }
  const variants = [...styles].sort().map((style) => {
    const styleFonts = fonts.filter(font => normalizeStyle(font?.style) === style)
    const weights = [...new Set(fonts
      .filter(font => normalizeStyle(font?.style) === style)
      .map(font => Number(font?.weight))
      .filter(Number.isFinite))].sort((a, b) => a - b)
    const supportsVariableWeight = hasItalicAxis
      || styleFonts.some(font => String(font?.filename).includes('wght'))
    return {
      style,
      weights,
      ...(weightRange && supportsVariableWeight ? { weightRange } : {}),
    }
  })

  return {
    family,
    category,
    license: String(metadata.license ?? 'UNKNOWN'),
    subsets: [...new Set(arrayOf(metadata.subsets).map(String))].sort(),
    variants,
  }
}

export function createGoogleFontsSnapshot(entries, sourceCommit) {
  const families = entries
    .map(normalizeGoogleFontMetadata)
    .sort((a, b) => a.family.localeCompare(b.family, 'en'))

  return {
    source: 'https://github.com/google/fonts',
    sourceCommit,
    families,
  }
}
