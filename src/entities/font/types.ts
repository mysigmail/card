export type GoogleFontCategory = 'display' | 'handwriting' | 'monospace' | 'sans-serif' | 'serif'
export type GoogleFontStyle = 'italic' | 'normal'

export interface GoogleFontVariant {
  style: GoogleFontStyle
  weights: number[]
  weightRange?: [number, number]
}

export interface GoogleFontFamily {
  family: string
  category: GoogleFontCategory
  license: string
  subsets: string[]
  variants: GoogleFontVariant[]
}

export interface GoogleFontsSnapshot {
  source: string
  sourceCommit: string
  families: GoogleFontFamily[]
}

export interface FontOption {
  label: string
  value: string
}
