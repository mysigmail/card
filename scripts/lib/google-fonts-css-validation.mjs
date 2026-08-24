function encodeFamily(family) {
  return encodeURIComponent(family).replaceAll('%20', '+')
}

export function createGoogleFontsCssUrl(font) {
  const tuples = font.variants
    .flatMap((variant) => {
      const italic = variant.style === 'italic' ? 1 : 0
      if (variant.weightRange)
        return [`${italic},${variant.weightRange[0]}..${variant.weightRange[1]}`]
      return variant.weights.map(weight => `${italic},${weight}`)
    })
    .sort((a, b) => {
      const [aItalic, aWeight] = a.split(',').map(Number)
      const [bItalic, bWeight] = b.split(',').map(Number)
      return aItalic - bItalic || aWeight - bWeight
    })

  const family = encodeFamily(font.family)
  if (tuples.length === 0)
    return `https://fonts.googleapis.com/css2?family=${family}&display=swap`
  return `https://fonts.googleapis.com/css2?family=${family}:ital,wght@${tuples.join(';')}&display=swap`
}

export async function filterSupportedGoogleFonts(
  families,
  check,
  { concurrency = 12, onProgress = () => {} } = {},
) {
  const supportedByIndex = Array.from({ length: families.length }).fill(false)
  const excluded = []
  let nextIndex = 0
  let completed = 0

  async function worker() {
    while (nextIndex < families.length) {
      const index = nextIndex
      nextIndex += 1
      const font = families[index]
      const result = await check(font, createGoogleFontsCssUrl(font))
      supportedByIndex[index] = result.ok
      if (!result.ok)
        excluded.push({ family: font.family, status: result.status })
      completed += 1
      onProgress({ completed, excluded: excluded.length, total: families.length })
    }
  }

  const workerCount = Math.min(Math.max(1, concurrency), families.length)
  await Promise.all(Array.from({ length: workerCount }, () => worker()))

  return {
    supported: families.filter((_, index) => supportedByIndex[index]),
    excluded: excluded.sort((a, b) => a.family.localeCompare(b.family, 'en')),
  }
}
