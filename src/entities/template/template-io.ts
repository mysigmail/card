import type { IOptions } from 'sanitize-html'
import type {
  CanvasBlockInstance,
  GeneralTool,
  TemplateExportMeta,
  TemplateExportV2,
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
  payload?: TemplateExportV2
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
const MENU_ITEM_TYPE_VALUES = new Set(['text', 'image'])
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

function isFiniteNumber(value: unknown): value is number {
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

  if (value.type === 'text') {
    if (!isString(value.value))
      pushIssue(issues, `${path}.value`, 'text atom value must be a string')

    if (value.color !== undefined && !isString(value.color)) {
      pushIssue(issues, `${path}.color`, 'text atom color must be a string')
    }

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

  if (value.type === 'menu') {
    if (
      value.itemType !== undefined
      && (!isString(value.itemType) || !MENU_ITEM_TYPE_VALUES.has(value.itemType))
    ) {
      pushIssue(issues, `${path}.itemType`, 'menu atom itemType must be "text" or "image"')
    }

    if (value.gap !== undefined && !isFiniteNumber(value.gap)) {
      pushIssue(issues, `${path}.gap`, 'menu atom gap must be a finite number')
    }

    if (!Array.isArray(value.items)) {
      pushIssue(issues, `${path}.items`, 'menu atom items must be an array')
      return
    }

    value.items.forEach((item, index) => {
      const itemPath = `${path}.items[${index}]`

      if (!isRecord(item)) {
        pushIssue(issues, itemPath, 'menu atom item must be an object')
        return
      }

      if (
        item.type !== undefined
        && (!isString(item.type) || !MENU_ITEM_TYPE_VALUES.has(item.type))
      ) {
        pushIssue(issues, `${itemPath}.type`, 'menu atom item type must be "text" or "image"')
        return
      }

      const normalizedType
        = item.type === 'image'
          ? 'image'
          : item.type === 'text'
            ? 'text'
            : value.itemType === 'image'
              ? 'image'
              : 'text'

      if (!isString(item.link)) {
        pushIssue(issues, `${itemPath}.link`, 'menu atom item link must be a string')
      }

      if (normalizedType === 'image') {
        if (!isString(item.name))
          pushIssue(issues, `${itemPath}.name`, 'menu atom item name must be a string')
        if (!isString(item.url))
          pushIssue(issues, `${itemPath}.url`, 'menu atom item url must be a string')
        if (!isString(item.alt))
          pushIssue(issues, `${itemPath}.alt`, 'menu atom item alt must be a string')
        if (item.width !== undefined && !isFiniteNumber(item.width)) {
          pushIssue(issues, `${itemPath}.width`, 'menu atom item width must be a finite number')
        }
        if (item.height !== undefined && !isFiniteNumber(item.height)) {
          pushIssue(issues, `${itemPath}.height`, 'menu atom item height must be a finite number')
        }
        return
      }

      if (!isString(item.text))
        pushIssue(issues, `${itemPath}.text`, 'menu atom item text must be a string')
      if (!isString(item.color))
        pushIssue(issues, `${itemPath}.color`, 'menu atom item color must be a string')
      if (!isFiniteNumber(item.fontSize)) {
        pushIssue(issues, `${itemPath}.fontSize`, 'menu atom item fontSize must be a finite number')
      }
    })

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

  if (!Array.isArray(value.atoms)) {
    pushIssue(issues, `${path}.atoms`, 'cell.atoms must be an array')
    return
  }

  value.atoms.forEach((atom, atomIndex) => {
    validateAtom(atom, `${path}.atoms[${atomIndex}]`, issues)
  })

  if (value.rows === undefined)
    return

  if (!Array.isArray(value.rows)) {
    pushIssue(issues, `${path}.rows`, 'cell.rows must be an array')
    return
  }

  value.rows.forEach((row, rowIndex) => {
    validateRowNode(row, `${path}.rows[${rowIndex}]`, issues)
  })
}

function validateRowNode(value: unknown, path: string, issues: TemplateValidationIssue[]) {
  if (!isRecord(value)) {
    pushIssue(issues, path, 'row must be an object')
    return
  }

  if (!isString(value.id))
    pushIssue(issues, `${path}.id`, 'row.id must be a string')

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

function sanitizeTextEditorHtml(value: string) {
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
        ...atom,
        color: atom.color || '#111827',
        value: sanitizeTextEditorHtml(atom.value),
      }
    }

    if (atom.type === 'image') {
      return {
        ...atom,
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

    if (atom.type === 'menu') {
      const normalizedItemType
        = atom.itemType === 'image'
          ? 'image'
          : atom.itemType === 'text'
            ? 'text'
            : atom.items[0]?.type === 'image'
              ? 'image'
              : 'text'

      return {
        ...atom,
        itemType: normalizedItemType,
        gap: isFiniteNumber(atom.gap) && atom.gap >= 0 ? atom.gap : 10,
        items: Array.isArray(atom.items)
          ? atom.items.map((item) => {
              if (normalizedItemType === 'image') {
                return {
                  type: 'image' as const,
                  name:
                    item?.type === 'image'
                      ? typeof item.name === 'string'
                        ? item.name
                        : ''
                      : typeof item?.text === 'string'
                        ? item.text
                        : '',
                  link: typeof item?.link === 'string' ? item.link : '',
                  url: item?.type === 'image' ? (typeof item.url === 'string' ? item.url : '') : '',
                  width:
                    item?.type === 'image' && isFiniteNumber(item.width) && item.width > 0
                      ? item.width
                      : undefined,
                  height:
                    item?.type === 'image' && isFiniteNumber(item.height) && item.height > 0
                      ? item.height
                      : undefined,
                  alt: item?.type === 'image' ? (typeof item.alt === 'string' ? item.alt : '') : '',
                }
              }

              return {
                type: 'text' as const,
                text:
                  item?.type === 'text'
                    ? typeof item.text === 'string'
                      ? item.text
                      : ''
                    : typeof item?.name === 'string'
                      ? item.name
                      : '',
                link: typeof item?.link === 'string' ? item.link : '',
                color:
                  item?.type === 'text' && typeof item.color === 'string' ? item.color : '#000000',
                fontSize:
                  item?.type === 'text' && isFiniteNumber(item.fontSize) && item.fontSize > 0
                    ? item.fontSize
                    : 16,
              }
            })
          : [],
      }
    }

    return atom
  })
}

function sanitizeCellNodes(cells: CellNode[]): CellNode[] {
  return cells.map(cell => ({
    ...cell,
    settings: {
      ...cell.settings,
      link: typeof cell.settings?.link === 'string' ? cell.settings.link : undefined,
      borderRadius:
        isFiniteNumber(cell.settings?.borderRadius) && cell.settings.borderRadius >= 0
          ? cell.settings.borderRadius
          : undefined,
    },
    atoms: sanitizeAtoms(cell.atoms),
    rows: sanitizeRowNodes(cell.rows || []),
  }))
}

function sanitizeRowNodes(rows: RowNode[]): RowNode[] {
  return rows.map(row => ({
    ...row,
    cells: sanitizeCellNodes(row.cells),
  }))
}

function sanitizeBlock(block: BlockNode): BlockNode {
  return {
    ...block,
    rows: sanitizeRowNodes(block.rows),
  }
}

function sanitizeTemplatePayload(payload: TemplateExportV2): TemplateExportV2 {
  const sanitized = clone<TemplateExportV2>(payload)

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

    if (component.version !== 2) {
      pushIssue(
        issues,
        `${currentPath}.version`,
        'Only block-v2 components are supported (component.version must be 2)',
      )
      return
    }

    validateCanvasBlockInstance(component, currentPath, issues)
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
    atoms: remapAtomIds(cell.atoms),
    rows: remapRowNodeIds(cell.rows || []),
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
      (component): component is Extract<CanvasBlockInstance, { version: 2 }> =>
        component.version === 2,
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
): TemplateExportV2 {
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
    payload: sanitizeTemplatePayload(migrated as TemplateExportV2),
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
