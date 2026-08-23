export type Insets = [number, number, number, number]

export interface SpacingValue {
  margin?: Insets
  padding?: Insets
}

export interface BackgroundImageValue {
  url: string
  repeat: 'repeat' | 'no-repeat'
  size: 'unset' | 'cover' | 'contain'
  position: 'top' | 'center' | 'bottom' | 'left' | 'right'
}

export type BorderStyle = 'solid' | 'dashed' | 'dotted'

export interface BorderSideValue {
  width: number
  style: BorderStyle
  color: string
}

export interface BorderValue {
  top?: BorderSideValue
  right?: BorderSideValue
  bottom?: BorderSideValue
  left?: BorderSideValue
}

export interface BorderRadiusValue {
  topLeft: number
  topRight: number
  bottomRight: number
  bottomLeft: number
}
