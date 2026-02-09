import type { ToolGroupRef, ToolGroupRole } from '@/types/editor'

interface CreateGroupOptions<TId extends string = string> {
  id?: TId
  label?: string
}

interface ToolGroupCarrier {
  groupId?: string
  groupRole?: ToolGroupRole
  groupLabel?: string
}

export function resolveToolGroup(group: ToolGroupCarrier): ToolGroupRef | undefined {
  if (!group.groupId || !group.groupRole)
    return undefined

  return {
    id: group.groupId,
    role: group.groupRole,
    label: group.groupLabel || group.groupId,
  }
}

export function createSchemaGroups() {
  const counters = new Map<string, number>()

  function group<TRole extends ToolGroupRole, TId extends string>(
    role: TRole,
    options: CreateGroupOptions<TId> & { id: TId },
  ): { id: TId, role: TRole, label: string }
  function group<TRole extends ToolGroupRole>(
    role: TRole,
    options?: CreateGroupOptions,
  ): ToolGroupRef
  function group(role: ToolGroupRole, options?: CreateGroupOptions): ToolGroupRef {
    const next = (counters.get(role) || 0) + 1
    counters.set(role, next)

    return {
      id: options?.id || `${role}_${next}`,
      role,
      label: options?.label || role,
    }
  }

  function repeat(
    role: ToolGroupRole,
    count: number,
    options?: CreateGroupOptions | ((index: number) => CreateGroupOptions | undefined),
  ) {
    return Array.from({ length: count }, (_, index) => {
      const value = typeof options === 'function' ? options(index) : options
      return group(role, value)
    })
  }

  return {
    group,
    repeat,
  }
}

export function gp<TGroup extends ToolGroupRef, TField extends string>(
  group: TGroup,
  field: TField,
): `${TGroup['id']}.${TField}`
export function gp<TField extends string>(
  group: ToolGroupRef,
  field: TField,
): `${string}.${TField}` {
  return `${group.id}.${field}`
}
