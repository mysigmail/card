import type {
  AlignTool,
  BackgroundImageTool,
  ColorPickerTool,
  ImageTool,
  InputNumberTool,
  InputTool,
  MultiTool,
  PaddingTool,
  SpacingTool,
  TextEditorTool,
  ToggleTool,
} from '@/types/editor'
import { nanoid } from 'nanoid'
import { toolBuilder } from '@/components/email-components/utils'

interface FieldConfig {
  group?: string
}

interface AlignConfig extends FieldConfig {
  value: AlignTool['value']
}

interface BackgroundImageConfig extends FieldConfig {
  value: BackgroundImageTool['value']
}

interface ColorConfig extends FieldConfig {
  value: string
}

interface ImageConfig extends FieldConfig {
  value: ImageTool['value']
}

interface InputConfig extends FieldConfig {
  key: string
  label: string
  value: string
}

interface InputNumberConfig extends FieldConfig {
  key: string
  label: string
  value: number
}

interface ListConfig extends FieldConfig {
  value: MultiTool['value']
}

interface PaddingConfig extends FieldConfig {
  value: PaddingTool['value']
}

interface SpacingConfig extends FieldConfig {
  value: SpacingTool['value']
}

interface TextConfig extends FieldConfig {
  value: string
}

interface ToggleConfig extends FieldConfig {
  value?: boolean
}

interface MenuItemConfig {
  name: string
  link: string
  color: string
  fontSize: number
}

interface SocialItemConfig {
  image: ImageTool['value']
  link: string
  name: string
}

export const f = {
  align(config: AlignConfig) {
    return toolBuilder<AlignTool>({
      group: config.group,
      key: 'align',
      label: 'Align',
      type: 'align',
      value: config.value,
    })
  },
  backgroundColor(config: ColorConfig) {
    return toolBuilder<ColorPickerTool>({
      group: config.group,
      key: 'backgroundColor',
      label: 'Background Color',
      type: 'colorPicker',
      value: config.value,
    })
  },
  backgroundImage(config: BackgroundImageConfig) {
    return toolBuilder<BackgroundImageTool>({
      group: config.group,
      key: 'backgroundImage',
      label: 'Background Image',
      type: 'bgImage',
      value: config.value,
    })
  },
  color(config: ColorConfig) {
    return toolBuilder<ColorPickerTool>({
      group: config.group,
      key: 'color',
      label: 'Color',
      type: 'colorPicker',
      value: config.value,
    })
  },
  content(config: TextConfig) {
    return toolBuilder<TextEditorTool>({
      group: config.group,
      key: 'content',
      label: 'Content',
      type: 'textEditor',
      value: config.value,
    })
  },
  fontSize(config: { value: number }) {
    return toolBuilder<InputNumberTool>({
      key: 'fontSize',
      label: 'Font Size',
      type: 'inputNumber',
      value: config.value,
    })
  },
  image(config: ImageConfig) {
    return toolBuilder<ImageTool>({
      group: config.group,
      key: 'image',
      label: 'Image',
      type: 'image',
      value: config.value,
    })
  },
  input(config: InputConfig) {
    return toolBuilder<InputTool>({
      group: config.group,
      key: config.key,
      label: config.label,
      type: 'input',
      value: config.value,
    })
  },
  inputNumber(config: InputNumberConfig) {
    return toolBuilder<InputNumberTool>({
      group: config.group,
      key: config.key,
      label: config.label,
      type: 'inputNumber',
      value: config.value,
    })
  },
  link(config: { value: string }) {
    return toolBuilder<InputTool>({
      key: 'link',
      label: 'Link',
      type: 'input',
      value: config.value,
    })
  },
  list(config: ListConfig) {
    return toolBuilder<MultiTool>({
      group: config.group,
      key: 'list',
      label: 'List',
      type: 'multi',
      value: config.value,
    })
  },
  mainColor(config: ColorConfig) {
    return toolBuilder<ColorPickerTool>({
      group: config.group,
      key: 'mainColor',
      label: 'Main Color',
      type: 'colorPicker',
      value: config.value,
    })
  },
  menuItem(config: MenuItemConfig): MultiTool['value'][number] {
    return {
      id: nanoid(8),
      tools: [
        toolBuilder<InputTool>({
          key: 'name',
          label: 'Name',
          type: 'input',
          value: config.name,
        }),
        toolBuilder<InputTool>({
          key: 'link',
          label: 'Link',
          type: 'input',
          value: config.link,
        }),
        toolBuilder<ColorPickerTool>({
          key: 'color',
          label: 'Color',
          type: 'colorPicker',
          value: config.color,
        }),
        toolBuilder<InputNumberTool>({
          key: 'fontSize',
          label: 'Font Size',
          type: 'inputNumber',
          value: config.fontSize,
        }),
      ],
    }
  },
  name(config: { value: string }) {
    return toolBuilder<InputTool>({
      key: 'name',
      label: 'Name',
      type: 'input',
      value: config.value,
    })
  },
  padding(config: PaddingConfig) {
    return toolBuilder<PaddingTool>({
      group: config.group,
      key: 'padding',
      label: 'Padding',
      type: 'padding',
      value: config.value,
    })
  },
  showHide(config: ToggleConfig) {
    return toolBuilder<ToggleTool>({
      group: config.group,
      key: 'showHide',
      label: 'Show / Hide',
      type: 'toggle',
      value: config.value === undefined ? true : config.value,
    })
  },
  socialItem(config: SocialItemConfig): MultiTool['value'][number] {
    return {
      id: nanoid(8),
      tools: [
        toolBuilder<InputTool>({
          key: 'name',
          label: 'Name',
          type: 'input',
          value: config.name,
        }),
        toolBuilder<InputTool>({
          key: 'link',
          label: 'Link',
          type: 'input',
          value: config.link,
        }),
        toolBuilder<ImageTool>({
          group: 'Logo',
          key: 'image',
          label: 'Image',
          type: 'image',
          value: config.image,
        }),
      ],
    }
  },
  spacing(config: SpacingConfig) {
    return toolBuilder<SpacingTool>({
      group: config.group,
      key: 'spacings',
      label: 'Spacings',
      type: 'spacing',
      value: config.value,
    })
  },
}
