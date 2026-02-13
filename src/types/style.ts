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
