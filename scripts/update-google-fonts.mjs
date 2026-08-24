import { execFileSync } from 'node:child_process'
import { globSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import { filterSupportedGoogleFonts } from './lib/google-fonts-css-validation.mjs'
import { createGoogleFontsSnapshot, parseTextproto } from './lib/google-fonts-metadata.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const checkout = mkdtempSync(join(tmpdir(), 'card-google-fonts-'))
const skipCssValidation = process.argv.includes('--skip-css-validation')
const CSS_VALIDATION_CONCURRENCY = 12
const CSS_VALIDATION_RETRIES = 3

function git(...args) {
  return execFileSync('git', args, { cwd: checkout, encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] }).trim()
}

async function checkGoogleFontsCss(_font, url) {
  let lastError
  for (let attempt = 1; attempt <= CSS_VALIDATION_RETRIES; attempt += 1) {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CardGoogleFontsSnapshot/1.0)',
        },
        signal: AbortSignal.timeout(15_000),
      })
      if (response.ok || (response.status >= 400 && response.status < 500 && response.status !== 429))
        return { ok: response.ok, status: response.status }
      lastError = new Error(`Google Fonts CSS returned HTTP ${response.status}`)
    }
    catch (error) {
      lastError = error
    }

    if (attempt < CSS_VALIDATION_RETRIES)
      await new Promise(resolve => setTimeout(resolve, 250 * 2 ** (attempt - 1)))
  }

  throw new Error(`Transient failure validating ${url}`, { cause: lastError })
}

try {
  git('clone', '--depth=1', '--filter=blob:none', '--no-checkout', 'https://github.com/google/fonts.git', '.')
  git('sparse-checkout', 'init', '--no-cone')
  writeFileSync(join(checkout, '.git/info/sparse-checkout'), '/*/*/METADATA.pb\n')
  git('checkout')

  const sourceCommit = git('rev-parse', 'HEAD')
  const files = globSync('{apache,ofl,ufl}/*/METADATA.pb', { cwd: checkout })
  const entries = files.map((file) => {
    try {
      return parseTextproto(readFileSync(join(checkout, file), 'utf8'))
    }
    catch (error) {
      throw new Error(`Could not parse ${file}`, { cause: error })
    }
  })
  const snapshot = createGoogleFontsSnapshot(entries, sourceCommit)
  if (!skipCssValidation) {
    console.log(`Validating ${snapshot.families.length} generated URLs against Google Fonts CSS2…`)
    const validation = await filterSupportedGoogleFonts(snapshot.families, checkGoogleFontsCss, {
      concurrency: CSS_VALIDATION_CONCURRENCY,
      onProgress({ completed, excluded, total }) {
        if (completed % 100 === 0 || completed === total)
          console.log(`Validated ${completed}/${total}; excluded ${excluded}`)
      },
    })
    snapshot.families = validation.supported
    if (validation.excluded.length) {
      console.warn(
        `Excluded ${validation.excluded.length} unsupported families: ${validation.excluded
          .map(item => `${item.family} (HTTP ${item.status})`)
          .join(', ')}`,
      )
    }
  }
  const output = resolve(root, 'src/entities/font/google-fonts.json')
  writeFileSync(output, `${JSON.stringify(snapshot, null, 2)}\n`)
  console.log(`Wrote ${snapshot.families.length} families from ${sourceCommit} to ${output}`)
}
finally {
  rmSync(checkout, { force: true, recursive: true })
}
