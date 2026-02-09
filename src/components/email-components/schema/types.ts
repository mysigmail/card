export type SchemaGroupFields<TField extends string> = Record<TField, unknown>

export type SchemaModelShape = object
export type SchemaGroup<TModel extends SchemaModelShape> = Extract<keyof TModel, string>
export type SchemaProperty<
  TModel extends SchemaModelShape,
  TGroup extends SchemaGroup<TModel>,
> = TModel[TGroup] extends object ? Extract<keyof TModel[TGroup], string> : never
export type SchemaPath<
  TModel extends SchemaModelShape,
  TGroup extends SchemaGroup<TModel> = SchemaGroup<TModel>,
> = TGroup extends SchemaGroup<TModel> ? `${TGroup}.${SchemaProperty<TModel, TGroup>}` : never

export interface EmailBlockSchema<TModel extends SchemaModelShape = any> {
  root?: {
    attrs?: SchemaPath<TModel>
    clickGroup?: SchemaGroup<TModel>
  }
  nodes: SchemaNode<TModel>[]
}

interface BaseSchemaNode<TModel extends SchemaModelShape> {
  if?: SchemaPath<TModel>
}

export interface RowSchemaNode<TModel extends SchemaModelShape> extends BaseSchemaNode<TModel> {
  type: 'row'
  clickGroup?: SchemaGroup<TModel>
  styleBindings?: Record<string, SchemaPath<TModel>>
  children: RowChildSchemaNode<TModel>[]
}

export interface DividerSchemaNode<TModel extends SchemaModelShape> extends BaseSchemaNode<TModel> {
  type: 'divider'
  group: SchemaGroup<TModel>
  color?: SchemaPath<TModel>
  styleBindings?: Record<string, SchemaPath<TModel>>
}

interface BaseRowChildSchemaNode<TModel extends SchemaModelShape> extends BaseSchemaNode<TModel> {
  group: SchemaGroup<TModel>
  align?: SchemaPath<TModel>
}

export interface LogoSchemaNode<TModel extends SchemaModelShape>
  extends BaseRowChildSchemaNode<TModel> {
  type: 'logo'
  attrs?: SchemaPath<TModel>
  link?: SchemaPath<TModel>
}

export interface MenuSchemaNode<TModel extends SchemaModelShape>
  extends BaseRowChildSchemaNode<TModel> {
  type: 'menu'
  items?: SchemaPath<TModel>
}

export interface SocialSchemaNode<TModel extends SchemaModelShape>
  extends BaseRowChildSchemaNode<TModel> {
  type: 'social'
  items?: SchemaPath<TModel>
}

export interface TextSchemaNode<TModel extends SchemaModelShape>
  extends BaseRowChildSchemaNode<TModel> {
  type: 'text'
  attrs?: SchemaPath<TModel>
  value?: SchemaPath<TModel>
}

export type RowChildSchemaNode<TModel extends SchemaModelShape> =
  | LogoSchemaNode<TModel>
  | MenuSchemaNode<TModel>
  | SocialSchemaNode<TModel>
  | TextSchemaNode<TModel>
export type SchemaNode<TModel extends SchemaModelShape> =
  | RowSchemaNode<TModel>
  | DividerSchemaNode<TModel>

export function defineEmailBlockSchema<TModel extends SchemaModelShape>(
  schema: EmailBlockSchema<TModel>,
) {
  return schema
}
