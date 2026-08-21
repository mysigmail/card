import type { BackgroundImageTool, ImageTool, SpacingTool } from './types'

export const DEFAULT_BACKGROUND_IMAGE: BackgroundImageTool['value'] = {
  url: '',
  repeat: 'no-repeat',
  size: 'cover',
  position: 'center',
}

export function toSpacingValue(value: unknown): SpacingTool['value'] {
  const raw = (value || {}) as SpacingTool['value']
  const next: SpacingTool['value'] = {}

  if (Array.isArray(raw.padding) && raw.padding.length === 4) {
    next.padding = raw.padding.map(i => Number(i) || 0) as [number, number, number, number]
  }

  if (Array.isArray(raw.margin) && raw.margin.length === 4) {
    next.margin = raw.margin.map(i => Number(i) || 0) as [number, number, number, number]
  }

  return next
}

export function toBackgroundImageValue(value: unknown): BackgroundImageTool['value'] {
  const raw = (value || {}) as Partial<BackgroundImageTool['value']>
  return {
    ...DEFAULT_BACKGROUND_IMAGE,
    ...raw,
    url: typeof raw.url === 'string' ? raw.url : '',
  }
}

export function toOptionalPositiveNumber(value: unknown): number | undefined {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

export function toImageValue(value: unknown): ImageTool['value'] {
  const raw = (value || {}) as Partial<ImageTool['value']>

  return {
    src: typeof raw.src === 'string' ? raw.src : '',
    alt: typeof raw.alt === 'string' ? raw.alt : '',
    link: typeof raw.link === 'string' ? raw.link : '',
    width: toOptionalPositiveNumber(raw.width),
    height: toOptionalPositiveNumber(raw.height),
  }
}

export function toNonNegativeFiniteNumber(value: unknown): number | undefined {
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined
}
