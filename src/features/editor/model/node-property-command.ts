import type {
  InspectorValueState,
  NodeMutationResult,
  NodePropertyCommand,
  NodeRef,
  PropertyMapForRef,
  ResolvedNode,
} from './inspector-types'
import type { CanvasBlockInstance } from './types'
import type { Atom, RowNode } from '@/entities/block'
import {
  atomPropertyRegistry,
  blockPropertyRegistry,
  cellPropertyRegistry,
  rowPropertyRegistry,
} from './inspector-registry'

function findRow(rows: RowNode[], rowId: string): RowNode | undefined {
  for (const row of rows) {
    if (row.id === rowId)
      return row
    for (const cell of row.cells) {
      const nested = findRow(
        cell.children.filter(child => child.type === 'row'),
        rowId,
      )
      if (nested)
        return nested
    }
  }
}

function hasRow(items: CanvasBlockInstance[], rowId: string) {
  return items.some(item => findRow(item.block.rows, rowId) !== undefined)
}

function hasCell(items: CanvasBlockInstance[], cellId: string) {
  return items.some((item) => {
    function visit(rows: RowNode[]): boolean {
      return rows.some(row =>
        row.cells.some(
          cell =>
            cell.id === cellId || visit(cell.children.filter(child => child.type === 'row')),
        ),
      )
    }
    return visit(item.block.rows)
  })
}

function hasAtom(items: CanvasBlockInstance[], atomId: string) {
  return items.some((item) => {
    function visit(rows: RowNode[]): boolean {
      return rows.some(row =>
        row.cells.some(
          cell =>
            cell.children.some(child => child.type !== 'row' && child.id === atomId)
            || visit(cell.children.filter(child => child.type === 'row')),
        ),
      )
    }
    return visit(item.block.rows)
  })
}

type MutationFailure = Extract<NodeMutationResult, { ok: false }>

export function resolveNode(
  items: CanvasBlockInstance[],
  ref: NodeRef,
): ResolvedNode | MutationFailure {
  const block = items.find(item => item.version === 1 && item.block.id === ref.blockId)?.block
  if (!block)
    return { ok: false, reason: 'node-not-found' }
  if (ref.kind === 'block')
    return { kind: 'block', node: block }

  const row = findRow(block.rows, ref.rowId)
  if (!row)
    return { ok: false, reason: hasRow(items, ref.rowId) ? 'node-path-mismatch' : 'node-not-found' }
  if (ref.kind === 'row')
    return { kind: 'row', node: row }

  const cell = row.cells.find(candidate => candidate.id === ref.cellId)
  if (!cell) {
    return {
      ok: false,
      reason: hasCell(items, ref.cellId) ? 'node-path-mismatch' : 'node-not-found',
    }
  }
  if (ref.kind === 'cell')
    return { kind: 'cell', node: cell }

  const atom = cell.children.find(
    (candidate): candidate is Atom => candidate.type !== 'row' && candidate.id === ref.atomId,
  )
  if (!atom) {
    return {
      ok: false,
      reason: hasAtom(items, ref.atomId) ? 'node-path-mismatch' : 'node-not-found',
    }
  }
  if (atom.type !== ref.atomType)
    return { ok: false, reason: 'node-type-mismatch' }
  return { kind: 'atom', node: atom }
}

function isFailure(value: ResolvedNode | MutationFailure): value is MutationFailure {
  return 'ok' in value && value.ok === false
}

function registryFor(resolved: ResolvedNode) {
  if (resolved.kind === 'block')
    return blockPropertyRegistry
  if (resolved.kind === 'row')
    return rowPropertyRegistry
  if (resolved.kind === 'cell')
    return cellPropertyRegistry
  return atomPropertyRegistry[resolved.node.type]
}

interface PreparedCommand {
  apply: () => void
  changed: boolean
}

function commandIdentity(command: NodePropertyCommand) {
  const { ref } = command
  if (ref.kind === 'block')
    return JSON.stringify(['block', ref.blockId, command.property])
  if (ref.kind === 'row')
    return JSON.stringify(['row', ref.blockId, ref.rowId, command.property])
  if (ref.kind === 'cell')
    return JSON.stringify(['cell', ref.blockId, ref.rowId, ref.cellId, command.property])
  return JSON.stringify([
    'atom',
    ref.blockId,
    ref.rowId,
    ref.cellId,
    ref.atomId,
    ref.atomType,
    command.property,
  ])
}

function prepareCommand(
  items: CanvasBlockInstance[],
  command: NodePropertyCommand,
): PreparedCommand | (NodeMutationResult & { ok: false }) {
  const resolved = resolveNode(items, command.ref)
  if (isFailure(resolved))
    return resolved

  const registry = registryFor(resolved) as Record<
    string,
    {
      read: (node: never) => unknown
      normalize: (value: unknown, current: never) => { ok: boolean, value?: unknown }
      equal: (current: never, next: never) => boolean
      apply: (node: never, value: never) => void
    }
  >
  const descriptor = registry[String(command.property)]
  if (!descriptor)
    return { ok: false, reason: 'unsupported-property' }

  const node = resolved.node as never
  const current = descriptor.read(node)
  const next = descriptor.normalize(command.value, current as never)
  if (!next.ok)
    return { ok: false, reason: 'invalid-value' }

  const changed = !descriptor.equal(current as never, next.value as never)
  return {
    changed,
    apply: () => {
      if (changed)
        descriptor.apply(node, next.value as never)
    },
  }
}

export function updateNodeProperties(
  items: CanvasBlockInstance[],
  commands: readonly NodePropertyCommand[],
): NodeMutationResult {
  const prepared: PreparedCommand[] = []
  const identities = new Set<string>()
  for (const command of commands) {
    const identity = commandIdentity(command)
    if (identities.has(identity))
      return { ok: false, reason: 'invalid-value' }
    identities.add(identity)

    const next = prepareCommand(items, command)
    if ('ok' in next)
      return next
    prepared.push(next)
  }

  for (const command of prepared) command.apply()

  return { ok: true, changed: prepared.some(command => command.changed) }
}

export function updateNodeProperty(
  items: CanvasBlockInstance[],
  command: NodePropertyCommand,
): NodeMutationResult {
  return updateNodeProperties(items, [command])
}

export function getNodePropertyState<R extends NodeRef, K extends keyof PropertyMapForRef<R>>(
  items: CanvasBlockInstance[],
  ref: R,
  property: K,
): InspectorValueState<PropertyMapForRef<R>[K]> {
  const resolved = resolveNode(items, ref)
  if (isFailure(resolved))
    return { kind: 'inapplicable', reason: resolved.reason }

  const descriptor = (registryFor(resolved) as Record<string, { read: (node: never) => unknown }>)[
    String(property)
  ]
  if (!descriptor)
    return { kind: 'inapplicable', reason: 'unsupported-property' }

  return {
    kind: 'value',
    value: descriptor.read(resolved.node as never) as PropertyMapForRef<R>[K],
  }
}
