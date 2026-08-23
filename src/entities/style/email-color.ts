export interface EmailColorChannels {
  red: number
  green: number
  blue: number
  alpha: number
}

export type ColorDisplayFormat = 'hex' | 'rgb' | 'hsl'

export interface HslColorChannels {
  hue: number
  saturation: number
  lightness: number
  alpha: number
}

export interface HsvColorChannels {
  hue: number
  saturation: number
  value: number
  alpha: number
}

const HEX_PATTERN = /^#([\da-f]{3}|[\da-f]{6}|[\da-f]{8})$/i
const RGBA_PATTERN
  = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*(0|1|0?\.\d+))?\s*\)$/i
const HSLA_PATTERN
  = /^hsla?\(\s*(-?(?:\d+(?:\.\d+)?|\.\d+))(?:deg)?\s*,\s*(\d+(?:\.\d+)?)%\s*,\s*(\d+(?:\.\d+)?)%(?:\s*,\s*(0|1|0?\.\d+))?\s*\)$/i

function byteToHex(value: number) {
  return Math.round(value).toString(16).padStart(2, '0').toUpperCase()
}

function formatAlpha(value: number) {
  return String(Number(value.toFixed(3)))
}

function clampByte(value: number) {
  return Math.min(255, Math.max(0, Math.round(value)))
}

function hueToRgb(p: number, q: number, hue: number) {
  let normalizedHue = hue
  if (normalizedHue < 0)
    normalizedHue += 1
  if (normalizedHue > 1)
    normalizedHue -= 1
  if (normalizedHue < 1 / 6)
    return p + (q - p) * 6 * normalizedHue
  if (normalizedHue < 1 / 2)
    return q
  if (normalizedHue < 2 / 3)
    return p + (q - p) * (2 / 3 - normalizedHue) * 6
  return p
}

export function hslToEmailColorChannels(color: HslColorChannels): EmailColorChannels {
  const hue = (((color.hue % 360) + 360) % 360) / 360
  const saturation = color.saturation / 100
  const lightness = color.lightness / 100
  if (saturation === 0) {
    const gray = clampByte(lightness * 255)
    return { red: gray, green: gray, blue: gray, alpha: color.alpha }
  }
  const q
    = lightness < 0.5 ? lightness * (1 + saturation) : lightness + saturation - lightness * saturation
  const p = 2 * lightness - q
  return {
    red: clampByte(hueToRgb(p, q, hue + 1 / 3) * 255),
    green: clampByte(hueToRgb(p, q, hue) * 255),
    blue: clampByte(hueToRgb(p, q, hue - 1 / 3) * 255),
    alpha: color.alpha,
  }
}

export function emailColorChannelsToHsl(color: EmailColorChannels): HslColorChannels {
  const red = color.red / 255
  const green = color.green / 255
  const blue = color.blue / 255
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const delta = max - min
  const lightness = (max + min) / 2
  let hue = 0
  let saturation = 0
  if (delta !== 0) {
    saturation = delta / (1 - Math.abs(2 * lightness - 1))
    if (max === red)
      hue = 60 * (((green - blue) / delta) % 6)
    else if (max === green)
      hue = 60 * ((blue - red) / delta + 2)
    else hue = 60 * ((red - green) / delta + 4)
  }
  return {
    hue: Math.round((hue < 0 ? hue + 360 : hue) * 10) / 10,
    saturation: Math.round(saturation * 1000) / 10,
    lightness: Math.round(lightness * 1000) / 10,
    alpha: color.alpha,
  }
}

export function hslToHsvColorChannels(color: HslColorChannels): HsvColorChannels {
  const saturation = color.saturation / 100
  const lightness = color.lightness / 100
  const value = lightness + saturation * Math.min(lightness, 1 - lightness)
  return {
    hue: ((color.hue % 360) + 360) % 360,
    saturation: value === 0 ? 0 : 2 * (1 - lightness / value) * 100,
    value: value * 100,
    alpha: color.alpha,
  }
}

export function hsvToHslColorChannels(color: HsvColorChannels): HslColorChannels {
  const saturation = color.saturation / 100
  const value = color.value / 100
  const lightness = value * (1 - saturation / 2)
  return {
    hue: ((color.hue % 360) + 360) % 360,
    saturation:
      lightness === 0 || lightness === 1
        ? 0
        : ((value - lightness) / Math.min(lightness, 1 - lightness)) * 100,
    lightness: lightness * 100,
    alpha: color.alpha,
  }
}

export function emailColorChannelsToHsv(color: EmailColorChannels): HsvColorChannels {
  const red = color.red / 255
  const green = color.green / 255
  const blue = color.blue / 255
  const max = Math.max(red, green, blue)
  const min = Math.min(red, green, blue)
  const delta = max - min
  let hue = 0
  if (delta !== 0) {
    if (max === red)
      hue = 60 * (((green - blue) / delta) % 6)
    else if (max === green)
      hue = 60 * ((blue - red) / delta + 2)
    else hue = 60 * ((red - green) / delta + 4)
  }
  return {
    hue: hue < 0 ? hue + 360 : hue,
    saturation: max === 0 ? 0 : (delta / max) * 100,
    value: max * 100,
    alpha: color.alpha,
  }
}

export function hsvToEmailColorChannels(color: HsvColorChannels): EmailColorChannels {
  const hue = ((color.hue % 360) + 360) % 360
  const saturation = color.saturation / 100
  const value = color.value / 100
  const chroma = value * saturation
  const segment = hue / 60
  const secondary = chroma * (1 - Math.abs((segment % 2) - 1))
  const offset = value - chroma
  let red = 0
  let green = 0
  let blue = 0
  if (segment < 1) {
    red = chroma
    green = secondary
  }
  else if (segment < 2) {
    red = secondary
    green = chroma
  }
  else if (segment < 3) {
    green = chroma
    blue = secondary
  }
  else if (segment < 4) {
    green = secondary
    blue = chroma
  }
  else if (segment < 5) {
    red = secondary
    blue = chroma
  }
  else {
    red = chroma
    blue = secondary
  }
  return {
    red: clampByte((red + offset) * 255),
    green: clampByte((green + offset) * 255),
    blue: clampByte((blue + offset) * 255),
    alpha: color.alpha,
  }
}

export function parseEmailColor(value: unknown): EmailColorChannels | undefined {
  if (typeof value !== 'string')
    return undefined
  const input = value.trim()
  const hexMatch = input.match(HEX_PATTERN)
  if (hexMatch) {
    let hex = hexMatch[1]!
    if (hex.length === 3)
      hex = [...hex].map(character => character.repeat(2)).join('')
    return {
      red: Number.parseInt(hex.slice(0, 2), 16),
      green: Number.parseInt(hex.slice(2, 4), 16),
      blue: Number.parseInt(hex.slice(4, 6), 16),
      alpha: hex.length === 8 ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1,
    }
  }
  const rgbaMatch = input.match(RGBA_PATTERN)
  if (rgbaMatch) {
    const channels = rgbaMatch.slice(1, 4).map(Number)
    const alpha = rgbaMatch[4] === undefined ? 1 : Number(rgbaMatch[4])
    if (channels.some(channel => channel < 0 || channel > 255) || alpha < 0 || alpha > 1)
      return undefined
    return { red: channels[0]!, green: channels[1]!, blue: channels[2]!, alpha }
  }
  return undefined
}

export function normalizeEmailColorChannels(color: EmailColorChannels) {
  const opaque = `#${byteToHex(color.red)}${byteToHex(color.green)}${byteToHex(color.blue)}`
  return color.alpha === 1
    ? opaque
    : `rgba(${color.red},${color.green},${color.blue},${formatAlpha(color.alpha)})`
}

export function normalizeEmailColor(
  value: unknown,
  options: { allowTransparent?: boolean } = {},
): string | undefined {
  if (
    typeof value === 'string'
    && (value.trim() === '' || value.trim().toLowerCase() === 'transparent')
  ) {
    return options.allowTransparent ? 'transparent' : undefined
  }
  const color = parseEmailColor(value)
  if (!color)
    return undefined
  return normalizeEmailColorChannels(color)
}

export function normalizeColorPickerInput(value: unknown): string | undefined {
  const emailColor = normalizeEmailColor(value)
  if (emailColor) {
    return emailColor
  }
  if (typeof value !== 'string')
    return undefined
  const hslaMatch = value.trim().match(HSLA_PATTERN)
  if (!hslaMatch)
    return undefined
  const hue = Number(hslaMatch[1])
  const saturation = Number(hslaMatch[2])
  const lightness = Number(hslaMatch[3])
  const alpha = hslaMatch[4] === undefined ? 1 : Number(hslaMatch[4])
  if (
    saturation < 0
    || saturation > 100
    || lightness < 0
    || lightness > 100
    || alpha < 0
    || alpha > 1
  ) {
    return undefined
  }
  return normalizeEmailColorChannels(hslToEmailColorChannels({ hue, saturation, lightness, alpha }))
}

export function resolveOpaqueEmailColor(value: string) {
  if (value === 'transparent')
    return '#FFFFFF'
  const color = parseEmailColor(value)
  return color
    ? `#${byteToHex(color.red)}${byteToHex(color.green)}${byteToHex(color.blue)}`
    : undefined
}

export function hasEmailColorAlpha(value: string) {
  const color = parseEmailColor(value)
  return Boolean(color && color.alpha < 1)
}

export function toPickerHexAlpha(value: string) {
  const color = parseEmailColor(value)
  if (!color)
    return '#000000FF'
  return `#${byteToHex(color.red)}${byteToHex(color.green)}${byteToHex(color.blue)}${byteToHex(color.alpha * 255)}`
}

export function formatColorChannel(value: number) {
  return String(Math.round(value))
}
