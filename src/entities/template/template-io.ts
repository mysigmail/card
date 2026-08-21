import type { IOptions } from 'sanitize-html'
import type {
  CanvasBlockInstance,
  GeneralTool,
  TemplateExportMeta,
  TemplateExportV3,
  TemplateValidationIssue,
  Tool,
  ToolCollectionItem,
} from './types'
import type { Atom, BlockNode, CellNode, RowNode } from '@/entities/block'
import { nanoid } from 'nanoid'
import sanitizeHtmlLib from 'sanitize-html'
import { clone } from '@/shared/lib/clone'
import { TEMPLATE_EXPORT_VERSION, TEMPLATE_MAX_COMPONENTS, TEMPLATE_MAX_JSON_BYTES } from './types'

interface CreateTemplateExportPayloadOptions {
  installed: CanvasBlockInstance[]
  general: GeneralTool
  title?: string
}

interface ParseTemplateExportPayloadOptions {
  maxComponents?: number
  maxJsonBytes?: number
  raw?: string
}

interface ParseTemplateExportPayloadResult {
  payload?: TemplateExportV3
  issues: TemplateValidationIssue[]
}

interface UnknownRecord {
  [key: string]: unknown
}

const TOOL_TYPES = new Set([
  'align',
  'bgImage',
  'columns',
  'colorPicker',
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
  'sub',
  'sup',
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
    'font-family': [/^[\w\s"',-]{1,200}$/],
    'font-size': [
      /^(?:(?:[1-9]\d?|1\d\d|2[0-4]\d|250)px|(?:0|[1-9]\d?)(?:\.\d+)?(?:em|rem)|[1-9]\d{0,2}(?:\.\d+)?%)$/,
    ],
    'font-style': [/^(normal|italic|oblique)$/],
    'font-weight': [/^(normal|bold|[1-9]00)$/],
    'height': [/^\d+(px|%)$/],
    'letter-spacing': [/^-?(?:0|[1-9]\d?)(?:\.\d+)?(?:px|em|rem)?$/],
    'line-height': [
      /^(?:(?:0|[1-9]\d?|1\d\d|2[0-4]\d|250)px|\d(?:\.\d+)?(?:em|rem)?|[1-9]\d{0,2}(?:\.\d+)?%)$/,
    ],
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

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}

function toOptionalBoolean(value: unknown): boolean | undefined {
  return typeof value === 'boolean' ? value : undefined
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

function _validateSchema(
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

function validateSpacingTuple(
  value: unknown,
  path: string,
  issues: TemplateValidationIssue[],
  label: 'padding' | 'margin',
) {
  if (value === undefined)
    return

  if (
    !Array.isArray(value)
    || value.length !== 4
    || value.some(entry => !isFiniteNumber(entry))
  ) {
    pushIssue(issues, `${path}.${label}`, `${label} must be a tuple of 4 finite numbers`)
  }
}

function validateSpacingValue(value: unknown, path: string, issues: TemplateValidationIssue[]) {
  if (!isRecord(value)) {
    pushIssue(issues, path, 'spacing must be an object')
    return
  }

  validateSpacingTuple(value.padding, path, issues, 'padding')
  validateSpacingTuple(value.margin, path, issues, 'margin')
}

function validateBackgroundImageValue(
  value: unknown,
  path: string,
  issues: TemplateValidationIssue[],
) {
  if (value === undefined)
    return

  if (!isRecord(value)) {
    pushIssue(issues, path, 'backgroundImage must be an object')
    return
  }

  if (!isString(value.url))
    pushIssue(issues, `${path}.url`, 'backgroundImage.url must be a string')

  if (!isString(value.repeat) || !BACKGROUND_REPEAT_VALUES.has(value.repeat)) {
    pushIssue(issues, `${path}.repeat`, 'backgroundImage.repeat must be "repeat" or "no-repeat"')
  }

  if (!isString(value.size) || !BACKGROUND_SIZE_VALUES.has(value.size)) {
    pushIssue(issues, `${path}.size`, 'backgroundImage.size must be "unset", "cover" or "contain"')
  }

  if (!isString(value.position) || !BACKGROUND_POSITION_VALUES.has(value.position)) {
    pushIssue(
      issues,
      `${path}.position`,
      'backgroundImage.position must be "top", "center", "bottom", "left" or "right"',
    )
  }
}

function validateAtom(value: unknown, path: string, issues: TemplateValidationIssue[]) {
  if (!isRecord(value)) {
    pushIssue(issues, path, 'atom must be an object')
    return
  }

  if (!isString(value.id))
    pushIssue(issues, `${path}.id`, 'atom.id must be a string')

  if (!isString(value.type))
    pushIssue(issues, `${path}.type`, 'atom.type must be a string')

  if (value.hiddenOnMobile !== undefined && typeof value.hiddenOnMobile !== 'boolean') {
    pushIssue(issues, `${path}.hiddenOnMobile`, 'atom.hiddenOnMobile must be a boolean')
  }

  if (value.type === 'text') {
    if (!isString(value.value))
      pushIssue(issues, `${path}.value`, 'text atom value must be a string')

    if (value.spacing !== undefined)
      validateSpacingValue(value.spacing, `${path}.spacing`, issues)

    return
  }

  if (value.type === 'button') {
    if (!isString(value.text))
      pushIssue(issues, `${path}.text`, 'button atom text must be a string')
    if (!isString(value.link))
      pushIssue(issues, `${path}.link`, 'button atom link must be a string')
    if (!isString(value.backgroundColor)) {
      pushIssue(issues, `${path}.backgroundColor`, 'button atom backgroundColor must be a string')
    }
    if (!isString(value.color))
      pushIssue(issues, `${path}.color`, 'button atom color must be a string')
    if (!isFiniteNumber(value.fontSize)) {
      pushIssue(issues, `${path}.fontSize`, 'button atom fontSize must be a finite number')
    }
    if (!isFiniteNumber(value.borderRadius)) {
      pushIssue(issues, `${path}.borderRadius`, 'button atom borderRadius must be a finite number')
    }
    validateSpacingTuple(value.padding, path, issues, 'padding')

    if (value.spacing !== undefined)
      validateSpacingValue(value.spacing, `${path}.spacing`, issues)

    return
  }

  if (value.type === 'divider') {
    if (!isString(value.color))
      pushIssue(issues, `${path}.color`, 'divider atom color must be a string')
    if (!isFiniteNumber(value.height)) {
      pushIssue(issues, `${path}.height`, 'divider atom height must be a finite number')
    }

    if (value.spacing !== undefined)
      validateSpacingValue(value.spacing, `${path}.spacing`, issues)

    return
  }

  if (value.type === 'image') {
    if (!isString(value.src))
      pushIssue(issues, `${path}.src`, 'image atom src must be a string')

    if (value.link !== undefined && !isString(value.link)) {
      pushIssue(issues, `${path}.link`, 'image atom link must be a string')
    }

    if (value.alt !== undefined && !isString(value.alt)) {
      pushIssue(issues, `${path}.alt`, 'image atom alt must be a string')
    }

    if (value.width !== undefined && !isFiniteNumber(value.width)) {
      pushIssue(issues, `${path}.width`, 'image atom width must be a finite number')
    }

    if (value.height !== undefined && !isFiniteNumber(value.height)) {
      pushIssue(issues, `${path}.height`, 'image atom height must be a finite number')
    }

    if (value.borderRadius !== undefined && !isFiniteNumber(value.borderRadius)) {
      pushIssue(issues, `${path}.borderRadius`, 'image atom borderRadius must be a finite number')
    }

    if (value.spacing !== undefined)
      validateSpacingValue(value.spacing, `${path}.spacing`, issues)

    return
  }

  pushIssue(issues, `${path}.type`, 'Unsupported atom type')
}

function validateCellNode(value: unknown, path: string, issues: TemplateValidationIssue[]) {
  if (!isRecord(value)) {
    pushIssue(issues, path, 'cell must be an object')
    return
  }

  if (!isString(value.id))
    pushIssue(issues, `${path}.id`, 'cell.id must be a string')

  if (!isRecord(value.settings)) {
    pushIssue(issues, `${path}.settings`, 'cell.settings must be an object')
  }
  else {
    validateSpacingValue(value.settings.spacing, `${path}.settings.spacing`, issues)

    if (!isString(value.settings.backgroundColor)) {
      pushIssue(
        issues,
        `${path}.settings.backgroundColor`,
        'cell.settings.backgroundColor must be a string',
      )
    }

    if (
      !isString(value.settings.verticalAlign)
      || !['top', 'middle', 'bottom'].includes(value.settings.verticalAlign)
    ) {
      pushIssue(
        issues,
        `${path}.settings.verticalAlign`,
        'cell.settings.verticalAlign must be "top", "middle" or "bottom"',
      )
    }

    if (
      value.settings.horizontalAlign !== undefined
      && (!isString(value.settings.horizontalAlign)
        || !['left', 'center', 'right'].includes(value.settings.horizontalAlign))
    ) {
      pushIssue(
        issues,
        `${path}.settings.horizontalAlign`,
        'cell.settings.horizontalAlign must be "left", "center" or "right"',
      )
    }

    if (value.settings.link !== undefined && !isString(value.settings.link)) {
      pushIssue(issues, `${path}.settings.link`, 'cell.settings.link must be a string')
    }

    if (
      value.settings.hiddenOnMobile !== undefined
      && typeof value.settings.hiddenOnMobile !== 'boolean'
    ) {
      pushIssue(
        issues,
        `${path}.settings.hiddenOnMobile`,
        'cell.settings.hiddenOnMobile must be a boolean',
      )
    }

    if (value.settings.collapseOnMobile !== undefined) {
      pushIssue(
        issues,
        `${path}.settings.collapseOnMobile`,
        'cell.settings.collapseOnMobile is no longer supported. Use row.settings.collapseOnMobile',
      )
    }

    if (value.settings.width !== undefined && !isFiniteNumber(value.settings.width)) {
      pushIssue(issues, `${path}.settings.width`, 'cell.settings.width must be a number')
    }

    if (value.settings.height !== undefined && !isFiniteNumber(value.settings.height)) {
      pushIssue(issues, `${path}.settings.height`, 'cell.settings.height must be a number')
    }

    if (value.settings.borderRadius !== undefined && !isFiniteNumber(value.settings.borderRadius)) {
      pushIssue(
        issues,
        `${path}.settings.borderRadius`,
        'cell.settings.borderRadius must be a number',
      )
    }

    validateBackgroundImageValue(
      value.settings.backgroundImage,
      `${path}.settings.backgroundImage`,
      issues,
    )
  }

  if (!Array.isArray(value.children)) {
    pushIssue(issues, `${path}.children`, 'cell.children must be an array')
    return
  }

  value.children.forEach((child, childIndex) => {
    const childPath = `${path}.children[${childIndex}]`
    if (isRecord(child) && child.type === 'row')
      validateRowNode(child, childPath, issues)
    else validateAtom(child, childPath, issues)
  })
}

function validateRowNode(value: unknown, path: string, issues: TemplateValidationIssue[]) {
  if (!isRecord(value)) {
    pushIssue(issues, path, 'row must be an object')
    return
  }

  if (!isString(value.id))
    pushIssue(issues, `${path}.id`, 'row.id must be a string')

  if (value.type !== 'row')
    pushIssue(issues, `${path}.type`, 'row.type must be "row"')

  if (!isRecord(value.settings)) {
    pushIssue(issues, `${path}.settings`, 'row.settings must be an object')
  }
  else {
    validateSpacingValue(value.settings.spacing, `${path}.settings.spacing`, issues)

    if (!isString(value.settings.backgroundColor)) {
      pushIssue(
        issues,
        `${path}.settings.backgroundColor`,
        'row.settings.backgroundColor must be a string',
      )
    }

    if (value.settings.height !== undefined && !isFiniteNumber(value.settings.height)) {
      pushIssue(issues, `${path}.settings.height`, 'row.settings.height must be a number')
    }

    if (!isFiniteNumber(value.settings.gap)) {
      pushIssue(issues, `${path}.settings.gap`, 'row.settings.gap must be a number')
    }

    if (
      !isString(value.settings.widthMode)
      || !['fill', 'hug'].includes(value.settings.widthMode)
    ) {
      pushIssue(
        issues,
        `${path}.settings.widthMode`,
        'row.settings.widthMode must be "fill" or "hug"',
      )
    }

    if (
      value.settings.hiddenOnMobile !== undefined
      && typeof value.settings.hiddenOnMobile !== 'boolean'
    ) {
      pushIssue(
        issues,
        `${path}.settings.hiddenOnMobile`,
        'row.settings.hiddenOnMobile must be a boolean',
      )
    }

    if (
      value.settings.collapseOnMobile !== undefined
      && typeof value.settings.collapseOnMobile !== 'boolean'
    ) {
      pushIssue(
        issues,
        `${path}.settings.collapseOnMobile`,
        'row.settings.collapseOnMobile must be a boolean',
      )
    }

    validateBackgroundImageValue(
      value.settings.backgroundImage,
      `${path}.settings.backgroundImage`,
      issues,
    )
  }

  if (!Array.isArray(value.cells)) {
    pushIssue(issues, `${path}.cells`, 'row.cells must be an array')
    return
  }

  value.cells.forEach((cell, cellIndex) => {
    validateCellNode(cell, `${path}.cells[${cellIndex}]`, issues)
  })
}

function validateCanvasBlockInstance(
  value: UnknownRecord,
  path: string,
  issues: TemplateValidationIssue[],
) {
  if (!isRecord(value.block)) {
    pushIssue(issues, `${path}.block`, 'block must be an object')
    return
  }

  const block = value.block

  if (!isString(block.id))
    pushIssue(issues, `${path}.block.id`, 'block.id must be a string')
  if (!isString(block.label))
    pushIssue(issues, `${path}.block.label`, 'block.label must be a string')

  if (!isRecord(block.settings)) {
    pushIssue(issues, `${path}.block.settings`, 'block.settings must be an object')
  }
  else {
    validateSpacingValue(block.settings.spacing, `${path}.block.settings.spacing`, issues)

    if (!isString(block.settings.backgroundColor)) {
      pushIssue(
        issues,
        `${path}.block.settings.backgroundColor`,
        'block.settings.backgroundColor must be a string',
      )
    }

    validateBackgroundImageValue(
      block.settings.backgroundImage,
      `${path}.block.settings.backgroundImage`,
      issues,
    )
  }

  if (!Array.isArray(block.rows)) {
    pushIssue(issues, `${path}.block.rows`, 'block.rows must be an array')
    return
  }

  block.rows.forEach((row, rowIndex) => {
    validateRowNode(row, `${path}.block.rows[${rowIndex}]`, issues)
  })
}

function _validateTool(
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

  if (value.type !== 'multi' && value.type !== 'columns')
    return

  if (!Array.isArray(value.value)) {
    pushIssue(issues, `${path}.value`, 'multi/columns tool value must be an array')
    return
  }

  value.value.forEach((item, index) => {
    const itemPath = `${path}.value[${index}]`
    if (!isRecord(item)) {
      pushIssue(issues, itemPath, 'multi/columns item must be an object')
      return
    }

    if (!isString(item.id))
      pushIssue(issues, `${itemPath}.id`, 'multi/columns item id must be a string')

    if (!Array.isArray(item.tools)) {
      pushIssue(issues, `${itemPath}.tools`, 'multi/columns item tools must be an array')
      return
    }

    item.tools.forEach((child, childIndex) => {
      _validateTool(child, `${itemPath}.tools[${childIndex}]`, issues, {
        ...options,
        requireGroup: false,
      })
    })
  })
}

export function sanitizeTextEditorHtml(value: string) {
  return sanitizeHtmlLib(value, EMAIL_TEXT_SANITIZE_OPTIONS)
}

function _sanitizeTools(tools: Tool[]): Tool[] {
  return tools.map((tool) => {
    if (tool.type === 'textEditor') {
      return {
        ...tool,
        value: sanitizeTextEditorHtml(tool.value),
      }
    }

    if (tool.type === 'multi' || tool.type === 'columns') {
      return {
        ...tool,
        value: tool.value.map((item: ToolCollectionItem) => ({
          ...item,
          tools: _sanitizeTools(item.tools),
        })),
      }
    }

    return tool
  })
}

function sanitizeAtoms(atoms: Atom[]): Atom[] {
  return atoms.map((atom) => {
    if (atom.type === 'text') {
      return {
        id: atom.id,
        type: atom.type,
        value: sanitizeTextEditorHtml(atom.value),
        spacing: atom.spacing,
        hiddenOnMobile: toOptionalBoolean(atom.hiddenOnMobile),
      }
    }

    if (atom.type === 'image') {
      return {
        ...atom,
        hiddenOnMobile: toOptionalBoolean(atom.hiddenOnMobile),
        src: typeof atom.src === 'string' ? atom.src : '',
        link: typeof atom.link === 'string' ? atom.link : '',
        alt: typeof atom.alt === 'string' ? atom.alt : '',
        width: isFiniteNumber(atom.width) && atom.width > 0 ? atom.width : undefined,
        height: isFiniteNumber(atom.height) && atom.height > 0 ? atom.height : undefined,
        borderRadius:
          isFiniteNumber(atom.borderRadius) && atom.borderRadius >= 0
            ? atom.borderRadius
            : undefined,
      }
    }

    return {
      ...atom,
      hiddenOnMobile: toOptionalBoolean(atom.hiddenOnMobile),
    }
  })
}

function sanitizeCellNodes(cells: CellNode[]): CellNode[] {
  return cells.map((cell) => {
    const settings = {
      ...cell.settings,
      link: typeof cell.settings?.link === 'string' ? cell.settings.link : undefined,
      hiddenOnMobile: toOptionalBoolean(cell.settings?.hiddenOnMobile),
      borderRadius:
        isFiniteNumber(cell.settings?.borderRadius) && cell.settings.borderRadius >= 0
          ? cell.settings.borderRadius
          : undefined,
    }

    // Hard-drop legacy per-cell collapse to keep exported schema clean.
    delete (settings as Record<string, unknown>).collapseOnMobile

    return {
      id: cell.id,
      settings,
      children: cell.children.map(child =>
        child.type === 'row' ? sanitizeRowNodes([child])[0]! : sanitizeAtoms([child])[0]!,
      ),
    }
  })
}

function sanitizeRowNodes(rows: RowNode[]): RowNode[] {
  return rows.map(row => ({
    id: row.id,
    type: 'row',
    settings: {
      ...row.settings,
      hiddenOnMobile: toOptionalBoolean(row.settings?.hiddenOnMobile),
      collapseOnMobile:
        typeof row.settings?.collapseOnMobile === 'boolean' ? row.settings.collapseOnMobile : true,
      widthMode: row.settings?.widthMode === 'hug' ? 'hug' : 'fill',
    },
    cells: sanitizeCellNodes(row.cells),
  }))
}

function sanitizeBlock(block: BlockNode): BlockNode {
  return {
    ...block,
    rows: sanitizeRowNodes(block.rows),
  }
}

function sanitizeTemplatePayload(payload: TemplateExportV3): TemplateExportV3 {
  const sanitized = clone<TemplateExportV3>(payload)

  sanitized.canvas.components = sanitized.canvas.components.map((component) => {
    return {
      ...component,
      block: sanitizeBlock(component.block),
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

    if (component.version !== 3) {
      pushIssue(
        issues,
        `${currentPath}.version`,
        'Only block-v3 components are supported (component.version must be 3)',
      )
      return
    }

    validateCanvasBlockInstance(component, currentPath, issues)
  })
}

function escapeLegacyText(value: unknown) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function migrateLegacyMenuAtom(atom: UnknownRecord): UnknownRecord {
  const items = Array.isArray(atom.items) ? atom.items : undefined
  const validItems = items?.every((rawItem) => {
    if (!isRecord(rawItem) || !isString(rawItem.link))
      return false
    const itemType = rawItem.type ?? atom.itemType ?? 'text'
    if (itemType === 'image') {
      return (
        isString(rawItem.name)
        && isString(rawItem.url)
        && isString(rawItem.alt)
        && (rawItem.width === undefined || isFiniteNumber(rawItem.width))
        && (rawItem.height === undefined || isFiniteNumber(rawItem.height))
      )
    }
    return (
      (rawItem.type === undefined || rawItem.type === 'text')
      && isString(rawItem.text)
      && isString(rawItem.color)
      && isFiniteNumber(rawItem.fontSize)
    )
  })
  if (
    !isString(atom.id)
    || !items
    || !validItems
    || (atom.itemType !== undefined && atom.itemType !== 'text' && atom.itemType !== 'image')
    || (atom.gap !== undefined && !isFiniteNumber(atom.gap))
  ) {
    return atom
  }

  return {
    id: atom.id,
    type: 'row',
    settings: {
      spacing: isRecord(atom.spacing) ? atom.spacing : {},
      backgroundColor: 'transparent',
      hiddenOnMobile: toOptionalBoolean(atom.hiddenOnMobile),
      collapseOnMobile: false,
      gap: isFiniteNumber(atom.gap) && atom.gap >= 0 ? atom.gap : 10,
      widthMode: 'hug',
    },
    cells: items.map((rawItem) => {
      const item = isRecord(rawItem) ? rawItem : {}
      const image = item.type === 'image' || (item.type === undefined && atom.itemType === 'image')
      const child: UnknownRecord = image
        ? {
            id: nanoid(8),
            type: 'image',
            src: isString(item.url) ? item.url : '',
            link: isString(item.link) ? item.link : '',
            alt: isString(item.alt) ? item.alt : '',
            width: isFiniteNumber(item.width) ? item.width : undefined,
            height: isFiniteNumber(item.height) ? item.height : undefined,
            borderRadius: 0,
            spacing: { margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
          }
        : {
            id: nanoid(8),
            type: 'text',
            value: `<p><a href="${escapeLegacyText(item.link)}"><span style="color:${escapeLegacyText(item.color || '#000000')};font-size:${isFiniteNumber(item.fontSize) ? item.fontSize : 16}px">${escapeLegacyText(item.text)}</span></a></p>`,
            spacing: { margin: [0, 0, 0, 0], padding: [0, 0, 0, 0] },
          }
      return {
        id: nanoid(8),
        settings: {
          spacing: {},
          backgroundColor: 'transparent',
          hiddenOnMobile: false,
          verticalAlign: 'top',
          horizontalAlign: 'left',
        },
        children: [child],
      }
    }),
  }
}

function migrateV2Cell(value: unknown): unknown {
  if (!isRecord(value))
    return value

  if (!Array.isArray(value.atoms))
    return { ...value, children: value.atoms }

  const atoms = value.atoms
  const rows = value.rows === undefined ? [] : value.rows
  if (!Array.isArray(rows))
    return { ...value, children: [...atoms, rows] }
  return {
    ...value,
    children: [
      ...atoms.map(atom =>
        isRecord(atom) && atom.type === 'menu' ? migrateLegacyMenuAtom(atom) : atom,
      ),
      ...rows.map(migrateV2Row),
    ],
    atoms: undefined,
    rows: undefined,
  }
}

function migrateV2Row(value: unknown): unknown {
  if (!isRecord(value))
    return value

  return {
    ...value,
    type: 'row',
    settings: isRecord(value.settings) ? { ...value.settings, widthMode: 'fill' } : value.settings,
    cells: Array.isArray(value.cells) ? value.cells.map(migrateV2Cell) : value.cells,
  }
}

function migrateLegacyBlock(block: unknown): BlockNode {
  if (!isRecord(block))
    throw new TypeError('Legacy catalog block must be an object')

  return {
    ...clone<UnknownRecord>(block),
    rows: Array.isArray(block.rows) ? block.rows.map(migrateV2Row) : block.rows,
  } as unknown as BlockNode
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

  if (value.version === 2) {
    const migrated = clone<UnknownRecord>(value)
    migrated.version = TEMPLATE_EXPORT_VERSION
    if (isRecord(migrated.editor) && isRecord(migrated.editor.general))
      normalizeGeneralBackgroundPosition(migrated.editor.general)
    if (isRecord(migrated.canvas) && Array.isArray(migrated.canvas.components)) {
      migrated.canvas.components = migrated.canvas.components.map((rawComponent) => {
        if (!isRecord(rawComponent))
          return rawComponent
        const block = isRecord(rawComponent.block) ? rawComponent.block : rawComponent.block
        return {
          ...rawComponent,
          version: rawComponent.version === 2 ? 3 : rawComponent.version,
          block: isRecord(block) ? migrateLegacyBlock(block) : block,
        }
      })
    }
    return migrated
  }

  return value
}

function _remapToolIds(tools: Tool[]): Tool[] {
  return tools.map((tool) => {
    if (tool.type === 'multi' || tool.type === 'columns') {
      return {
        ...tool,
        id: nanoid(8),
        value: tool.value.map((item: ToolCollectionItem) => ({
          ...item,
          id: nanoid(8),
          tools: _remapToolIds(item.tools),
        })),
      }
    }

    return {
      ...tool,
      id: nanoid(8),
    }
  })
}

function remapAtomIds(atoms: Atom[]): Atom[] {
  return atoms.map(atom => ({
    ...atom,
    id: nanoid(8),
  }))
}

function remapCellNodeIds(cells: CellNode[]): CellNode[] {
  return cells.map(cell => ({
    ...cell,
    id: nanoid(8),
    children: cell.children.map(child =>
      child.type === 'row' ? remapRowNodeIds([child])[0]! : remapAtomIds([child])[0]!,
    ),
  }))
}

function remapRowNodeIds(rows: RowNode[]): RowNode[] {
  return rows.map(row => ({
    ...row,
    id: nanoid(8),
    cells: remapCellNodeIds(row.cells),
  }))
}

function remapBlockIds(block: BlockNode): BlockNode {
  return {
    ...block,
    id: nanoid(8),
    rows: remapRowNodeIds(block.rows),
  }
}

export function createRuntimeComponents(components: CanvasBlockInstance[]) {
  return components
    .filter(
      (component): component is Extract<CanvasBlockInstance, { version: 3 }> =>
        component.version === 3,
    )
    .map((component) => {
      return {
        ...component,
        id: nanoid(8),
        block: remapBlockIds(component.block),
      }
    })
}

export function createTemplateExportPayload(
  options: CreateTemplateExportPayloadOptions,
): TemplateExportV3 {
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
    payload: sanitizeTemplatePayload(migrated as TemplateExportV3),
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
