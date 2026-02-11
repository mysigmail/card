import type { IOptions } from 'sanitize-html'
import type { Component, GeneralTool, Tool, ToolCollectionItem } from '@/types/editor'
import type {
  TemplateExportMeta,
  TemplateExportV1,
  TemplateValidationIssue,
} from '@/types/template'
import { nanoid } from 'nanoid'
import sanitizeHtmlLib from 'sanitize-html'
import {
  TEMPLATE_EXPORT_VERSION,
  TEMPLATE_MAX_COMPONENTS,
  TEMPLATE_MAX_JSON_BYTES,
} from '@/types/template'
import { clone } from '@/utils'

interface CreateTemplateExportPayloadOptions {
  installed: Component[]
  general: GeneralTool
  title?: string
}

interface ParseTemplateExportPayloadOptions {
  maxComponents?: number
  maxJsonBytes?: number
  raw?: string
}

interface ParseTemplateExportPayloadResult {
  payload?: TemplateExportV1
  issues: TemplateValidationIssue[]
}

interface UnknownRecord {
  [key: string]: unknown
}

const TOOL_TYPES = new Set([
  'align',
  'bgImage',
  'colorPicker',
  'grid',
  'image',
  'input',
  'inputNumber',
  'multi',
  'padding',
  'select',
  'spacing',
  'textEditor',
  'toggle',
])

const BACKGROUND_REPEAT_VALUES = new Set(['repeat', 'no-repeat'])
const BACKGROUND_SIZE_VALUES = new Set(['unset', 'cover', 'contain'])
const BACKGROUND_POSITION_VALUES = new Set(['top', 'center', 'bottom', 'left', 'right'])
const EMAIL_TEXT_ALLOWED_TAGS = [
  'a',
  'b',
  'blockquote',
  'br',
  'code',
  'div',
  'em',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'hr',
  'i',
  'li',
  'ol',
  'p',
  'span',
  'strong',
  'u',
  'ul',
]

const EMAIL_TEXT_ALLOWED_ATTRIBUTES: IOptions['allowedAttributes'] = {
  '*': ['style'],
  'a': ['href', 'name', 'target', 'rel'],
}

const EMAIL_TEXT_ALLOWED_STYLES: NonNullable<IOptions['allowedStyles']> = {
  '*': {
    'background-color': [/^#[0-9a-f]{3,8}$/i, /^rgb(a?)\([^)]*\)$/i],
    'border': [/^[\d\s.a-z#%,()-]+$/i],
    'border-radius': [/^[\d\s.%]+$/],
    'color': [/^#[0-9a-f]{3,8}$/i, /^rgb(a?)\([^)]*\)$/i],
    'display': [/^[a-z-]+$/i],
    'font-family': [/^[\w\s"',-]+$/],
    'font-size': [/^\d+(px|em|rem|%)$/],
    'font-style': [/^(normal|italic|oblique)$/],
    'font-weight': [/^(normal|bold|[1-9]00)$/],
    'height': [/^\d+(px|%)$/],
    'letter-spacing': [/^-?\d+(px|em|rem)?$/],
    'line-height': [/^\d+(\.\d+)?(px|em|rem|%)?$/],
    'margin': [/^[\d\s.%-]+$/],
    'margin-bottom': [/^-?\d+(px|em|rem|%)$/],
    'margin-left': [/^-?\d+(px|em|rem|%)$/],
    'margin-right': [/^-?\d+(px|em|rem|%)$/],
    'margin-top': [/^-?\d+(px|em|rem|%)$/],
    'padding': [/^[\d\s.%]+$/],
    'padding-bottom': [/^\d+(px|em|rem|%)$/],
    'padding-left': [/^\d+(px|em|rem|%)$/],
    'padding-right': [/^\d+(px|em|rem|%)$/],
    'padding-top': [/^\d+(px|em|rem|%)$/],
    'text-align': [/^(left|right|center|justify)$/],
    'text-decoration': [/^[a-z\s-]+$/i],
    'width': [/^\d+(px|%)$/],
  },
}

const EMAIL_TEXT_SANITIZE_OPTIONS: IOptions = {
  allowedAttributes: EMAIL_TEXT_ALLOWED_ATTRIBUTES,
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedStyles: EMAIL_TEXT_ALLOWED_STYLES,
  allowedTags: EMAIL_TEXT_ALLOWED_TAGS,
  allowProtocolRelative: false,
  disallowedTagsMode: 'discard',
  parseStyleAttributes: true,
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isFiniteNumber(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value)
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function pushIssue(issues: TemplateValidationIssue[], path: string, message: string) {
  issues.push({ path, message })
}

function normalizeGeneralBackgroundPosition(general: UnknownRecord) {
  if (!isRecord(general.background))
    return

  if (general.background.position === 'button')
    general.background.position = 'bottom'
}

function createTemplateMeta(title?: string): TemplateExportMeta {
  const now = new Date().toISOString()

  return {
    id: `tpl_${nanoid(8)}`,
    title: title?.trim() || 'Untitled template',
    createdAt: now,
    updatedAt: now,
  }
}

function validateSchemaPath(
  value: unknown,
  path: string,
  groupIds: Set<string>,
  issues: TemplateValidationIssue[],
) {
  if (value === undefined)
    return

  if (!isString(value)) {
    pushIssue(issues, path, 'Schema path must be a string')
    return
  }

  const parts = value.split('.')
  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    pushIssue(issues, path, 'Schema path must match "groupId.field"')
    return
  }

  if (!groupIds.has(parts[0]))
    pushIssue(issues, path, `Unknown group "${parts[0]}" in schema path`)
}

function validateGroupRef(
  value: unknown,
  path: string,
  groupIds: Set<string>,
  issues: TemplateValidationIssue[],
  required = false,
) {
  if (value === undefined) {
    if (required)
      pushIssue(issues, path, 'Group reference is required')
    return
  }

  if (!isString(value)) {
    pushIssue(issues, path, 'Group reference must be a string')
    return
  }

  if (!groupIds.has(value))
    pushIssue(issues, path, `Unknown group "${value}"`)
}

function validateStyleBindings(
  value: unknown,
  path: string,
  groupIds: Set<string>,
  issues: TemplateValidationIssue[],
) {
  if (value === undefined)
    return

  if (!isRecord(value)) {
    pushIssue(issues, path, 'styleBindings must be an object')
    return
  }

  Object.entries(value).forEach(([key, entry]) => {
    validateSchemaPath(entry, `${path}.${key}`, groupIds, issues)
  })
}

function validateTextChildren(
  value: unknown,
  path: string,
  groupIds: Set<string>,
  issues: TemplateValidationIssue[],
) {
  if (value === undefined)
    return

  if (!Array.isArray(value)) {
    pushIssue(issues, path, 'text.children must be an array')
    return
  }

  value.forEach((child, index) => {
    const currentPath = `${path}[${index}]`

    if (!isRecord(child)) {
      pushIssue(issues, currentPath, 'Child node must be an object')
      return
    }

    if (child.type !== 'button') {
      pushIssue(issues, currentPath, 'Only button is allowed inside text.children')
      return
    }

    validateGroupRef(child.group, `${currentPath}.group`, groupIds, issues, true)
    validateSchemaPath(child.if, `${currentPath}.if`, groupIds, issues)
    validateSchemaPath(child.align, `${currentPath}.align`, groupIds, issues)
    validateSchemaPath(child.width, `${currentPath}.width`, groupIds, issues)
    validateSchemaPath(child.attrs, `${currentPath}.attrs`, groupIds, issues)
    validateSchemaPath(child.text, `${currentPath}.text`, groupIds, issues)
  })
}

function validateRowChild(
  child: unknown,
  path: string,
  groupIds: Set<string>,
  issues: TemplateValidationIssue[],
) {
  if (!isRecord(child)) {
    pushIssue(issues, path, 'Row child must be an object')
    return
  }

  if (!isString(child.type)) {
    pushIssue(issues, `${path}.type`, 'Row child type must be a string')
    return
  }

  validateGroupRef(child.group, `${path}.group`, groupIds, issues, true)
  validateSchemaPath(child.if, `${path}.if`, groupIds, issues)
  validateSchemaPath(child.align, `${path}.align`, groupIds, issues)
  validateSchemaPath(child.width, `${path}.width`, groupIds, issues)

  switch (child.type) {
    case 'image':
      validateSchemaPath(child.attrs, `${path}.attrs`, groupIds, issues)
      validateSchemaPath(child.link, `${path}.link`, groupIds, issues)
      return
    case 'menu':
    case 'social':
      validateSchemaPath(child.items, `${path}.items`, groupIds, issues)
      return
    case 'text':
      validateSchemaPath(child.attrs, `${path}.attrs`, groupIds, issues)
      validateSchemaPath(child.link, `${path}.link`, groupIds, issues)
      validateSchemaPath(child.value, `${path}.value`, groupIds, issues)
      validateTextChildren(child.children, `${path}.children`, groupIds, issues)
      return
    case 'grid':
      validateSchemaPath(child.items, `${path}.items`, groupIds, issues)
      validateSchemaPath(child.gap, `${path}.gap`, groupIds, issues)
      return
    case 'button':
      validateSchemaPath(child.attrs, `${path}.attrs`, groupIds, issues)
      validateSchemaPath(child.text, `${path}.text`, groupIds, issues)
      return
    default:
      pushIssue(issues, `${path}.type`, `Unsupported row child type "${child.type}"`)
  }
}

function validateSchema(
  value: unknown,
  path: string,
  groupIds: Set<string>,
  issues: TemplateValidationIssue[],
) {
  if (!isRecord(value)) {
    pushIssue(issues, path, 'schema must be an object')
    return
  }

  const root = value.root
  if (root !== undefined) {
    if (!isRecord(root)) {
      pushIssue(issues, `${path}.root`, 'schema.root must be an object')
    }
    else {
      validateSchemaPath(root.attrs, `${path}.root.attrs`, groupIds, issues)
      validateGroupRef(root.clickGroup, `${path}.root.clickGroup`, groupIds, issues)
    }
  }

  if (!Array.isArray(value.nodes)) {
    pushIssue(issues, `${path}.nodes`, 'schema.nodes must be an array')
    return
  }

  value.nodes.forEach((node, index) => {
    const currentPath = `${path}.nodes[${index}]`

    if (!isRecord(node)) {
      pushIssue(issues, currentPath, 'Schema node must be an object')
      return
    }

    if (!isString(node.type)) {
      pushIssue(issues, `${currentPath}.type`, 'Schema node type must be a string')
      return
    }

    validateSchemaPath(node.if, `${currentPath}.if`, groupIds, issues)

    if (node.type === 'row') {
      validateGroupRef(node.clickGroup, `${currentPath}.clickGroup`, groupIds, issues)
      validateStyleBindings(node.styleBindings, `${currentPath}.styleBindings`, groupIds, issues)

      if (!Array.isArray(node.children)) {
        pushIssue(issues, `${currentPath}.children`, 'row.children must be an array')
        return
      }

      node.children.forEach((child, childIndex) => {
        validateRowChild(child, `${currentPath}.children[${childIndex}]`, groupIds, issues)
      })

      return
    }

    if (node.type === 'divider') {
      validateGroupRef(node.group, `${currentPath}.group`, groupIds, issues, true)
      validateSchemaPath(node.color, `${currentPath}.color`, groupIds, issues)
      validateStyleBindings(node.styleBindings, `${currentPath}.styleBindings`, groupIds, issues)
      return
    }

    pushIssue(issues, `${currentPath}.type`, `Unsupported schema node type "${node.type}"`)
  })
}

function validateGeneral(general: unknown, path: string, issues: TemplateValidationIssue[]) {
  if (!isRecord(general)) {
    pushIssue(issues, path, 'editor.general must be an object')
    return
  }

  if (
    !Array.isArray(general.padding)
    || general.padding.length !== 4
    || general.padding.some(value => !isFiniteNumber(value))
  ) {
    pushIssue(issues, `${path}.padding`, 'general.padding must be a tuple of 4 finite numbers')
  }

  if (!isRecord(general.background)) {
    pushIssue(issues, `${path}.background`, 'general.background must be an object')
  }
  else {
    const background = general.background

    if (!isString(background.color))
      pushIssue(issues, `${path}.background.color`, 'background.color must be a string')

    if (background.image !== undefined && !isString(background.image)) {
      pushIssue(issues, `${path}.background.image`, 'background.image must be a string')
    }

    if (!isString(background.repeat) || !BACKGROUND_REPEAT_VALUES.has(background.repeat)) {
      pushIssue(
        issues,
        `${path}.background.repeat`,
        'background.repeat must be "repeat" or "no-repeat"',
      )
    }

    if (!isString(background.size) || !BACKGROUND_SIZE_VALUES.has(background.size)) {
      pushIssue(
        issues,
        `${path}.background.size`,
        'background.size must be "unset", "cover" or "contain"',
      )
    }

    if (!isString(background.position) || !BACKGROUND_POSITION_VALUES.has(background.position)) {
      pushIssue(
        issues,
        `${path}.background.position`,
        'background.position must be "top", "center", "bottom", "left" or "right"',
      )
    }
  }

  if (!isString(general.font))
    pushIssue(issues, `${path}.font`, 'general.font must be a string')

  if (!isString(general.previewText))
    pushIssue(issues, `${path}.previewText`, 'general.previewText must be a string')
}

function validateTool(
  value: unknown,
  path: string,
  issues: TemplateValidationIssue[],
  options: {
    requireGroup: boolean
    groupIds: Set<string>
    keysByGroup: Map<string, Set<string>>
  },
) {
  if (!isRecord(value)) {
    pushIssue(issues, path, 'tool must be an object')
    return
  }

  if (!isString(value.id))
    pushIssue(issues, `${path}.id`, 'tool.id must be a string')

  if (!isString(value.key))
    pushIssue(issues, `${path}.key`, 'tool.key must be a string')

  if (!isString(value.label))
    pushIssue(issues, `${path}.label`, 'tool.label must be a string')

  if (!isString(value.type) || !TOOL_TYPES.has(value.type)) {
    pushIssue(issues, `${path}.type`, 'tool.type is unsupported')
  }

  if (!('value' in value))
    pushIssue(issues, `${path}.value`, 'tool.value is required')

  if (options.requireGroup) {
    if (!isString(value.groupId) || !value.groupId)
      pushIssue(issues, `${path}.groupId`, 'Top-level tool.groupId is required')

    if (!isString(value.groupRole) || !value.groupRole) {
      pushIssue(issues, `${path}.groupRole`, 'Top-level tool.groupRole is required')
    }

    if (isString(value.groupId) && isString(value.key)) {
      options.groupIds.add(value.groupId)
      const keys = options.keysByGroup.get(value.groupId) || new Set<string>()
      if (keys.has(value.key)) {
        pushIssue(
          issues,
          `${path}.key`,
          `Duplicate tool.key "${value.key}" inside group "${value.groupId}"`,
        )
      }
      keys.add(value.key)
      options.keysByGroup.set(value.groupId, keys)
    }
  }

  if (value.type !== 'multi' && value.type !== 'grid')
    return

  if (!Array.isArray(value.value)) {
    pushIssue(issues, `${path}.value`, 'multi/grid tool value must be an array')
    return
  }

  value.value.forEach((item, index) => {
    const itemPath = `${path}.value[${index}]`
    if (!isRecord(item)) {
      pushIssue(issues, itemPath, 'multi/grid item must be an object')
      return
    }

    if (!isString(item.id))
      pushIssue(issues, `${itemPath}.id`, 'multi/grid item id must be a string')

    if (!Array.isArray(item.tools)) {
      pushIssue(issues, `${itemPath}.tools`, 'multi/grid item tools must be an array')
      return
    }

    item.tools.forEach((child, childIndex) => {
      validateTool(child, `${itemPath}.tools[${childIndex}]`, issues, {
        ...options,
        requireGroup: false,
      })
    })
  })
}

function sanitizeTextEditorHtml(value: string) {
  return sanitizeHtmlLib(value, EMAIL_TEXT_SANITIZE_OPTIONS)
}

function sanitizeTools(tools: Tool[]): Tool[] {
  return tools.map((tool) => {
    if (tool.type === 'textEditor') {
      return {
        ...tool,
        value: sanitizeTextEditorHtml(tool.value),
      }
    }

    if (tool.type === 'multi' || tool.type === 'grid') {
      return {
        ...tool,
        value: tool.value.map((item: ToolCollectionItem) => ({
          ...item,
          tools: sanitizeTools(item.tools),
        })),
      }
    }

    return tool
  })
}

function sanitizeTemplatePayload(payload: TemplateExportV1): TemplateExportV1 {
  const sanitized = clone<TemplateExportV1>(payload)

  sanitized.canvas.components = sanitized.canvas.components.map((component) => {
    return {
      ...component,
      tools: sanitizeTools(component.tools),
    }
  })

  return sanitized
}

function validateTemplatePayload(
  value: unknown,
  issues: TemplateValidationIssue[],
  options: ParseTemplateExportPayloadOptions,
) {
  if (!isRecord(value)) {
    pushIssue(issues, '$', 'Payload must be an object')
    return
  }

  if (value.version !== TEMPLATE_EXPORT_VERSION) {
    pushIssue(issues, '$.version', `Unsupported version. Expected ${TEMPLATE_EXPORT_VERSION}`)
  }

  if (!isRecord(value.meta)) {
    pushIssue(issues, '$.meta', 'meta must be an object')
  }
  else {
    if (!isString(value.meta.id))
      pushIssue(issues, '$.meta.id', 'meta.id must be a string')
    if (!isString(value.meta.title))
      pushIssue(issues, '$.meta.title', 'meta.title must be a string')
    if (!isString(value.meta.createdAt))
      pushIssue(issues, '$.meta.createdAt', 'meta.createdAt must be a string')
    if (!isString(value.meta.updatedAt))
      pushIssue(issues, '$.meta.updatedAt', 'meta.updatedAt must be a string')
    if (value.meta.appVersion !== undefined && !isString(value.meta.appVersion)) {
      pushIssue(issues, '$.meta.appVersion', 'meta.appVersion must be a string')
    }
  }

  if (!isRecord(value.editor)) {
    pushIssue(issues, '$.editor', 'editor must be an object')
  }
  else {
    validateGeneral(value.editor.general, '$.editor.general', issues)
  }

  if (!isRecord(value.canvas)) {
    pushIssue(issues, '$.canvas', 'canvas must be an object')
    return
  }

  if (!Array.isArray(value.canvas.components)) {
    pushIssue(issues, '$.canvas.components', 'canvas.components must be an array')
    return
  }

  const maxComponents = options.maxComponents || TEMPLATE_MAX_COMPONENTS
  if (value.canvas.components.length > maxComponents) {
    pushIssue(issues, '$.canvas.components', `Too many components. Limit is ${maxComponents}`)
  }

  value.canvas.components.forEach((component, index) => {
    const currentPath = `$.canvas.components[${index}]`

    if (!isRecord(component)) {
      pushIssue(issues, currentPath, 'component must be an object')
      return
    }

    if (!isString(component.id))
      pushIssue(issues, `${currentPath}.id`, 'component.id must be a string')
    if (!isString(component.name))
      pushIssue(issues, `${currentPath}.name`, 'component.name must be a string')
    if (!isString(component.label))
      pushIssue(issues, `${currentPath}.label`, 'component.label must be a string')
    if (!isString(component.type))
      pushIssue(issues, `${currentPath}.type`, 'component.type must be a string')
    if (!isString(component.preview))
      pushIssue(issues, `${currentPath}.preview`, 'component.preview must be a string')

    if (!Array.isArray(component.tools)) {
      pushIssue(issues, `${currentPath}.tools`, 'component.tools must be an array')
      return
    }

    const groupIds = new Set<string>()
    const keysByGroup = new Map<string, Set<string>>()

    component.tools.forEach((tool, toolIndex) => {
      validateTool(tool, `${currentPath}.tools[${toolIndex}]`, issues, {
        groupIds,
        keysByGroup,
        requireGroup: true,
      })
    })

    validateSchema(component.schema, `${currentPath}.schema`, groupIds, issues)
  })
}

function migrateTemplatePayload(value: unknown): unknown {
  if (!isRecord(value))
    return value

  if (value.version === TEMPLATE_EXPORT_VERSION) {
    const normalized = clone<UnknownRecord>(value)

    if (isRecord(normalized.editor) && isRecord(normalized.editor.general))
      normalizeGeneralBackgroundPosition(normalized.editor.general)

    return normalized
  }

  return value
}

function remapToolIds(tools: Tool[]): Tool[] {
  return tools.map((tool) => {
    if (tool.type === 'multi' || tool.type === 'grid') {
      return {
        ...tool,
        id: nanoid(8),
        value: tool.value.map((item: ToolCollectionItem) => ({
          ...item,
          id: nanoid(8),
          tools: remapToolIds(item.tools),
        })),
      }
    }

    return {
      ...tool,
      id: nanoid(8),
    }
  })
}

export function createRuntimeComponents(components: Component[]) {
  return components.map((component) => {
    return {
      ...component,
      id: nanoid(8),
      tools: remapToolIds(component.tools),
    } satisfies Component
  })
}

export function createTemplateExportPayload(
  options: CreateTemplateExportPayloadOptions,
): TemplateExportV1 {
  return {
    version: TEMPLATE_EXPORT_VERSION,
    meta: createTemplateMeta(options.title),
    editor: {
      general: clone(options.general),
    },
    canvas: {
      components: clone(options.installed),
    },
  }
}

export function parseTemplateExportPayload(
  payload: unknown,
  options: ParseTemplateExportPayloadOptions = {},
): ParseTemplateExportPayloadResult {
  const issues: TemplateValidationIssue[] = []

  if (options.raw) {
    const maxJsonBytes = options.maxJsonBytes || TEMPLATE_MAX_JSON_BYTES
    const bytes = new TextEncoder().encode(options.raw).length
    if (bytes > maxJsonBytes) {
      issues.push({
        path: '$',
        message: `JSON is too large. Limit is ${maxJsonBytes} bytes`,
      })

      return { issues }
    }
  }

  const migrated = migrateTemplatePayload(payload)
  validateTemplatePayload(migrated, issues, options)

  if (issues.length)
    return { issues }

  return {
    issues,
    payload: sanitizeTemplatePayload(migrated as TemplateExportV1),
  }
}

export function parseTemplateExportJson(
  raw: string,
  options: Omit<ParseTemplateExportPayloadOptions, 'raw'> = {},
): ParseTemplateExportPayloadResult {
  try {
    const parsed = JSON.parse(raw)

    return parseTemplateExportPayload(parsed, {
      ...options,
      raw,
    })
  }
  catch {
    return {
      issues: [
        {
          path: '$',
          message: 'Invalid JSON format',
        },
      ],
    }
  }
}
