import type {
  EmailBlockSchema,
  GridSchemaNode,
  ImageSchemaNode,
  RowSchemaNode,
  SchemaGroupFields,
  SchemaModelShape,
  TextSchemaNode,
} from '@/components/email-components/schema/types'
import type { Tool, ToolGroupRef, ToolGroupRole } from '@/types/editor'
import { createSchemaGroups, gp } from '@/components/email-components/schema/groups'
import { defineEmailBlockSchema } from '@/components/email-components/schema/types'

interface ComposeGroupSpec<
  TRole extends ToolGroupRole = ToolGroupRole,
  TId extends string = string,
> {
  role: TRole
  id: TId
  label?: string
}

type ComposeGroupSpecs = Record<string, ComposeGroupSpec>

type ComposeGroupFieldSpecs<TSpecs extends ComposeGroupSpecs> = {
  [K in keyof TSpecs]: readonly string[]
}

export type ComposeSchemaModel<
  TSpecs extends ComposeGroupSpecs,
  TFieldSpecs extends ComposeGroupFieldSpecs<TSpecs>,
> = {
  [K in keyof TSpecs as TSpecs[K]['id']]: SchemaGroupFields<Extract<TFieldSpecs[K][number], string>>
}

type ComposeGroups<TSpecs extends ComposeGroupSpecs> = {
  [K in keyof TSpecs]: ToolGroupRef & {
    id: TSpecs[K]['id']
    role: TSpecs[K]['role']
    label: string
  }
}

type ComposePathField<
  TSpecs extends ComposeGroupSpecs,
  TFieldSpecs extends ComposeGroupFieldSpecs<TSpecs> | undefined,
  TGroupKey extends keyof TSpecs,
> = TFieldSpecs extends ComposeGroupFieldSpecs<TSpecs>
  ? Extract<TFieldSpecs[TGroupKey][number], string>
  : string

type ComposePath<
  TSpecs extends ComposeGroupSpecs,
  TFieldSpecs extends ComposeGroupFieldSpecs<TSpecs> | undefined = undefined,
> = <K extends keyof TSpecs, TField extends ComposePathField<TSpecs, TFieldSpecs, K>>(
  groupKey: K,
  field: TField,
) => `${TSpecs[K]['id']}.${TField}`

interface ComposeContext<
  TSpecs extends ComposeGroupSpecs,
  TFieldSpecs extends ComposeGroupFieldSpecs<TSpecs> | undefined = undefined,
> {
  groups: ComposeGroups<TSpecs>
  path: ComposePath<TSpecs, TFieldSpecs>
}

interface ComposeEmailBlockConfig<
  TModel extends SchemaModelShape,
  TSpecs extends ComposeGroupSpecs,
> {
  groups: TSpecs
  schema: (context: ComposeContext<TSpecs>) => EmailBlockSchema<TModel>
  tools: (context: ComposeContext<TSpecs>) => Tool[]
}

interface ComposeEmailBlockConfigWithFields<
  TSpecs extends ComposeGroupSpecs,
  TFieldSpecs extends ComposeGroupFieldSpecs<TSpecs>,
> {
  groups: TSpecs
  fields: TFieldSpecs
  schema: (
    context: ComposeContext<TSpecs, TFieldSpecs>,
  ) => EmailBlockSchema<ComposeSchemaModel<TSpecs, TFieldSpecs>>
  tools: (context: ComposeContext<TSpecs, TFieldSpecs>) => Tool[]
}

interface ComposedEmailBlock<
  TModel extends SchemaModelShape,
  TSpecs extends ComposeGroupSpecs,
  TFieldSpecs extends ComposeGroupFieldSpecs<TSpecs> | undefined = undefined,
> {
  groups: ComposeGroups<TSpecs>
  schema: EmailBlockSchema<TModel>
  createTools: () => Tool[]
  fields?: TFieldSpecs
}

function createComposedGroups<TSpecs extends ComposeGroupSpecs>(
  specs: TSpecs,
): ComposeGroups<TSpecs> {
  const { group } = createSchemaGroups()

  const entries = Object.entries(specs) as [keyof TSpecs, TSpecs[keyof TSpecs]][]
  const builtEntries = entries.map(([key, spec]) => {
    return [
      key,
      group(spec.role, {
        id: spec.id,
        label: spec.label || spec.id,
      }),
    ] as const
  })

  return Object.fromEntries(builtEntries) as ComposeGroups<TSpecs>
}

export function composeEmailBlock<
  TSpecs extends ComposeGroupSpecs,
  TFieldSpecs extends ComposeGroupFieldSpecs<TSpecs>,
>(
  config: ComposeEmailBlockConfigWithFields<TSpecs, TFieldSpecs>,
): ComposedEmailBlock<ComposeSchemaModel<TSpecs, TFieldSpecs>, TSpecs, TFieldSpecs>
export function composeEmailBlock<
  TModel extends SchemaModelShape,
  TSpecs extends ComposeGroupSpecs,
>(config: ComposeEmailBlockConfig<TModel, TSpecs>): ComposedEmailBlock<TModel, TSpecs>
export function composeEmailBlock(
  config: ComposeEmailBlockConfig<any, any> | ComposeEmailBlockConfigWithFields<any, any>,
) {
  const groups = createComposedGroups(config.groups)

  const context = {
    groups,
    path(groupKey: string, field: string) {
      return gp(groups[groupKey], field)
    },
  }

  return {
    groups,
    schema: defineEmailBlockSchema(config.schema(context as any)),
    createTools: () => config.tools(context as any),
    fields: 'fields' in config ? config.fields : undefined,
  }
}

export function row<TModel extends SchemaModelShape>(
  config: Omit<RowSchemaNode<TModel>, 'type'>,
): RowSchemaNode<TModel> {
  return {
    type: 'row',
    ...config,
  }
}

export function image<TModel extends SchemaModelShape>(
  config: Omit<ImageSchemaNode<TModel>, 'type'>,
): ImageSchemaNode<TModel> {
  return {
    type: 'image',
    ...config,
  }
}

export function text<TModel extends SchemaModelShape>(
  config: Omit<TextSchemaNode<TModel>, 'type'>,
): TextSchemaNode<TModel> {
  return {
    type: 'text',
    ...config,
  }
}

export function grid<TModel extends SchemaModelShape>(
  config: Omit<GridSchemaNode<TModel>, 'type'>,
): GridSchemaNode<TModel> {
  return {
    type: 'grid',
    ...config,
  }
}
