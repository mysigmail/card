import type {
  AtomType,
  BlockNode,
  ButtonAtom,
  CellNode,
  DividerAtom,
  ImageAtom,
  RowNode,
  TextAtom,
} from '@/entities/block'
import type {
  BackgroundImageValue,
  BorderRadiusValue,
  BorderValue,
  SpacingValue,
} from '@/entities/style'

export interface BlockRef {
  kind: 'block'
  blockId: string
}

export interface RowRef {
  kind: 'row'
  blockId: string
  rowId: string
}

export interface CellRef {
  kind: 'cell'
  blockId: string
  rowId: string
  cellId: string
}

export interface AtomRef<T extends AtomType = AtomType> {
  kind: 'atom'
  blockId: string
  rowId: string
  cellId: string
  atomId: string
  atomType: T
}

export type NodeRef = BlockRef | RowRef | CellRef | AtomRef

export interface BlockPropertyMap {
  spacing: SpacingValue
  backgroundColor: string
  backgroundImage: BackgroundImageValue
  borderRadius: BorderRadiusValue
  border: BorderValue | undefined
  opacity: number
}

export interface RowPropertyMap extends BlockPropertyMap {
  widthMode: 'fill' | 'hug'
  gap: number
  height: number | undefined
  hiddenOnMobile: boolean
  collapseOnMobile: boolean
}

export interface CellPropertyMap extends BlockPropertyMap {
  link: string
  hiddenOnMobile: boolean
  verticalAlign: 'top' | 'middle' | 'bottom'
  horizontalAlign: 'left' | 'center' | 'right'
  borderRadius: BorderRadiusValue
  width: number | undefined
  height: number | undefined
}

export interface TextAtomPropertyMap {
  spacing: SpacingValue
  hiddenOnMobile: boolean
  value: string
  widthMode: 'fill' | 'hug' | undefined
  paragraphSpacing: number | undefined
  borderRadius: BorderRadiusValue
  border: BorderValue | undefined
  opacity: number
}

export type AtomCommonPropertyMap = Pick<
  TextAtomPropertyMap,
  'spacing' | 'hiddenOnMobile' | 'opacity'
>

export interface ButtonAtomPropertyMap {
  spacing: SpacingValue
  hiddenOnMobile: boolean
  text: string
  link: string
  backgroundColor: string
  color: string
  fontSize: number
  borderRadius: BorderRadiusValue
  border: BorderValue | undefined
  opacity: number
}

export interface DividerAtomPropertyMap {
  spacing: SpacingValue
  hiddenOnMobile: boolean
  color: string
  height: number
  opacity: number
}

export interface ImageAtomPropertyMap {
  spacing: SpacingValue
  hiddenOnMobile: boolean
  src: string
  alt: string
  link: string
  width: number | undefined
  height: number | undefined
  borderRadius: BorderRadiusValue
  border: BorderValue | undefined
  opacity: number
}

export interface AtomPropertyMap {
  text: TextAtomPropertyMap
  button: ButtonAtomPropertyMap
  divider: DividerAtomPropertyMap
  image: ImageAtomPropertyMap
}

type PropertyCommand<R, M> = {
  [K in keyof M]: { ref: R, property: K, value: M[K] }
}[keyof M]

export type BlockPropertyCommand = PropertyCommand<BlockRef, BlockPropertyMap>
export type RowPropertyCommand = PropertyCommand<RowRef, RowPropertyMap>
export type CellPropertyCommand = PropertyCommand<CellRef, CellPropertyMap>

type AtomVariantPropertyCommand<T extends AtomType = AtomType> = T extends AtomType
  ? PropertyCommand<AtomRef<T>, Omit<AtomPropertyMap[T], keyof AtomCommonPropertyMap>>
  : never

export type AtomPropertyCommand
  = | PropertyCommand<AtomRef, AtomCommonPropertyMap>
    | AtomVariantPropertyCommand

export type NodePropertyCommand
  = | BlockPropertyCommand
    | RowPropertyCommand
    | CellPropertyCommand
    | AtomPropertyCommand

export type NodeMutationFailureReason
  = | 'node-not-found'
    | 'node-path-mismatch'
    | 'node-type-mismatch'
    | 'unsupported-property'
    | 'invalid-value'

export type NodeMutationResult
  = | { ok: true, changed: boolean }
    | { ok: false, reason: NodeMutationFailureReason }

export type InspectorValueState<T>
  = | { kind: 'value', value: T }
    | { kind: 'mixed' }
    | { kind: 'locked', value: T, reason: string }
    | { kind: 'inapplicable', reason: string }

export type ResolvedNode
  = | { kind: 'block', node: BlockNode }
    | { kind: 'row', node: RowNode }
    | { kind: 'cell', node: CellNode }
    | { kind: 'atom', node: TextAtom | ButtonAtom | DividerAtom | ImageAtom }

export type PropertyMapForRef<R extends NodeRef> = R extends BlockRef
  ? BlockPropertyMap
  : R extends RowRef
    ? RowPropertyMap
    : R extends CellRef
      ? CellPropertyMap
      : R extends AtomRef<infer T>
        ? AtomPropertyMap[T]
        : never
