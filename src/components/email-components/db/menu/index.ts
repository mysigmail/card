import { nanoid } from 'nanoid'
import { images } from '../images'
import { COLOR } from '../../constants'
import { toolBuilder } from '../../utils'
import type {
  ColorPickerTool,
  ComponentBuilder,
  ImageTool,
  InputNumberTool,
  InputTool,
  MultiTool,
  PaddingTool,
  ToggleTool,
} from '@/types/editor'

const menu1: ComponentBuilder = (theme, label) => {
  const preview = theme === 'dark' ? images.components.menu1.dark : images.components.menu1.light
  const logo = theme === 'dark' ? images.logo.white : images.logo.black
  const bgColor = theme === 'dark' ? COLOR.theme.dark : COLOR.theme.light
  const linkColor = theme === 'dark' ? COLOR.theme.light : COLOR.theme.dark

  return {
    id: nanoid(8),
    name: 'Menu1',
    label,
    type: 'menu',
    preview,
    tools: [
      toolBuilder<PaddingTool>({
        group: 'Layout',
        label: 'Padding',
        type: 'padding',
        value: [30, 35, 30, 35],
      }),
      toolBuilder<ColorPickerTool>({
        group: 'Layout',
        label: 'Background Color',
        type: 'colorPicker',
        value: bgColor,
      }),
      toolBuilder<InputNumberTool>({
        group: 'Logo',
        label: 'Container Width',
        type: 'inputNumber',
        value: 372,
      }),
      toolBuilder<ImageTool>({
        group: 'Logo',
        label: 'Image',
        type: 'image',
        value: {
          src: logo,
          link: 'https://example.com',
          alt: 'Some alt',
          width: 110,
        },
      }),
      toolBuilder<ToggleTool>({
        group: 'Logo',
        label: 'Show / Hide',
        type: 'toggle',
        value: true,
      }),
      toolBuilder<InputNumberTool>({
        group: 'Menu',
        label: 'Container Width',
        type: 'inputNumber',
        value: 0,
      }),
      toolBuilder<MultiTool>({
        group: 'Menu',
        label: 'List',
        type: 'multi',
        value: [
          {
            id: nanoid(8),
            tools: [
              toolBuilder<InputTool>({
                label: 'Name',
                type: 'input',
                value: 'Specs',
              }),
              toolBuilder<InputTool>({
                label: 'Link',
                type: 'input',
                value: 'https://example',
              }),
              toolBuilder<ColorPickerTool>({
                label: 'Color',
                type: 'colorPicker',
                value: linkColor,
              }),
              toolBuilder<InputNumberTool>({
                label: 'Font Size',
                type: 'inputNumber',
                value: 16,
              }),
            ],
          },
          {
            id: nanoid(8),
            tools: [
              toolBuilder<InputTool>({
                label: 'Name',
                type: 'input',
                value: 'Feature',
              }),
              toolBuilder<InputTool>({
                label: 'Link',
                type: 'input',
                value: 'https://example',
              }),
              toolBuilder<ColorPickerTool>({
                label: 'Color',
                type: 'colorPicker',
                value: linkColor,
              }),
              toolBuilder<InputNumberTool>({
                label: 'Font Size',
                type: 'inputNumber',
                value: 16,
              }),
            ],
          },
          {
            id: nanoid(8),
            tools: [
              toolBuilder<InputTool>({
                label: 'Name',
                type: 'input',
                value: 'Price',
              }),
              toolBuilder<InputTool>({
                label: 'Link',
                type: 'input',
                value: 'https://example',
              }),
              toolBuilder<ColorPickerTool>({
                label: 'Color',
                type: 'colorPicker',
                value: linkColor,
              }),
              toolBuilder<InputNumberTool>({
                label: 'Font Size',
                type: 'inputNumber',
                value: 16,
              }),
            ],
          },
        ],
      }),
      toolBuilder<ToggleTool>({
        group: 'Menu',
        label: 'Show / Hide',
        type: 'toggle',
        value: true,
      }),
    ],
  }
}

const menu2: ComponentBuilder = (theme, label) => {
  const preview = theme === 'dark' ? images.components.menu2.dark : images.components.menu2.light
  const logo = theme === 'dark' ? images.logo.white : images.logo.black
  const bgColor = theme === 'dark' ? COLOR.theme.dark : COLOR.theme.light
  const linkColor = theme === 'dark' ? COLOR.theme.light : COLOR.theme.dark
  const divideColor = theme === 'dark' ? COLOR.divider.light : COLOR.divider.dark

  return {
    id: nanoid(8),
    name: 'Menu2',
    label,
    type: 'menu',
    preview,
    tools: [
      toolBuilder<PaddingTool>({
        group: 'Layout',
        label: 'Padding',
        type: 'padding',
        value: [30, 35, 30, 35],
      }),
      toolBuilder<ColorPickerTool>({
        group: 'Layout',
        label: 'Background Color',
        type: 'colorPicker',
        value: bgColor,
      }),
      toolBuilder<ColorPickerTool>({
        group: 'Divider',
        label: 'Color',
        type: 'colorPicker',
        value: divideColor,
      }),
      toolBuilder<ToggleTool>({
        group: 'Divider',
        label: 'Show / Hide',
        type: 'toggle',
        value: true,
      }),
      toolBuilder<ImageTool>({
        group: 'Logo',
        label: 'Image',
        type: 'image',
        value: {
          src: logo,
          link: 'https://example.com',
          alt: 'Some alt',
          width: 110,
        },
      }),
      toolBuilder<ToggleTool>({
        group: 'Logo',
        label: 'Show / Hide',
        type: 'toggle',
        value: true,
      }),
      toolBuilder<MultiTool>({
        group: 'Menu',
        label: 'List',
        type: 'multi',
        value: [
          {
            id: nanoid(8),
            tools: [
              toolBuilder<InputTool>({
                label: 'Name',
                type: 'input',
                value: 'Specs',
              }),
              toolBuilder<InputTool>({
                label: 'Link',
                type: 'input',
                value: 'https://example',
              }),
              toolBuilder<ColorPickerTool>({
                label: 'Color',
                type: 'colorPicker',
                value: linkColor,
              }),
              toolBuilder<InputNumberTool>({
                label: 'Font Size',
                type: 'inputNumber',
                value: 16,
              }),
            ],
          },
          {
            id: nanoid(8),
            tools: [
              toolBuilder<InputTool>({
                label: 'Name',
                type: 'input',
                value: 'Feature',
              }),
              toolBuilder<InputTool>({
                label: 'Link',
                type: 'input',
                value: 'https://example',
              }),
              toolBuilder<ColorPickerTool>({
                label: 'Color',
                type: 'colorPicker',
                value: linkColor,
              }),
              toolBuilder<InputNumberTool>({
                label: 'Font Size',
                type: 'inputNumber',
                value: 16,
              }),
            ],
          },
          {
            id: nanoid(8),
            tools: [
              toolBuilder<InputTool>({
                label: 'Name',
                type: 'input',
                value: 'Price',
              }),
              toolBuilder<InputTool>({
                label: 'Link',
                type: 'input',
                value: 'https://example',
              }),
              toolBuilder<ColorPickerTool>({
                label: 'Color',
                type: 'colorPicker',
                value: linkColor,
              }),
              toolBuilder<InputNumberTool>({
                label: 'Font Size',
                type: 'inputNumber',
                value: 16,
              }),
            ],
          },
        ],
      }),
      toolBuilder<ToggleTool>({
        group: 'Menu',
        label: 'Show / Hide',
        type: 'toggle',
        value: true,
      }),
    ],
  }
}

const menu3: ComponentBuilder = (theme, label) => {
  const preview = theme === 'dark' ? images.components.menu3.dark : images.components.menu3.light
  const logo = theme === 'dark' ? images.logo.white : images.logo.black
  const bgColor = theme === 'dark' ? COLOR.theme.dark : COLOR.theme.light
  const facebook = theme === 'dark' ? images.socials.facebook.white : images.socials.facebook.black
  const twitter = theme === 'dark' ? images.socials.twitter.white : images.socials.twitter.black
  const instagram
    = theme === 'dark' ? images.socials.instagram.white : images.socials.instagram.black

  return {
    id: nanoid(8),
    name: 'Menu3',
    label,
    type: 'menu',
    preview,
    tools: [
      toolBuilder<PaddingTool>({
        group: 'Layout',
        label: 'Padding',
        type: 'padding',
        value: [30, 35, 30, 35],
      }),
      toolBuilder<ColorPickerTool>({
        group: 'Layout',
        label: 'Background Color',
        type: 'colorPicker',
        value: bgColor,
      }),
      toolBuilder<InputNumberTool>({
        group: 'Logo',
        label: 'Container Width',
        type: 'inputNumber',
        value: 442,
      }),
      toolBuilder<ImageTool>({
        group: 'Logo',
        label: 'Image',
        type: 'image',
        value: {
          src: logo,
          link: 'https://example.com',
          alt: 'Some alt',
          width: 110,
        },
      }),
      toolBuilder<ToggleTool>({
        group: 'Logo',
        label: 'Show / Hide',
        type: 'toggle',
        value: true,
      }),
      toolBuilder<InputNumberTool>({
        group: 'Menu',
        label: 'Container Width',
        type: 'inputNumber',
        value: 0,
      }),
      toolBuilder<MultiTool>({
        group: 'Menu',
        label: 'List',
        type: 'multi',
        value: [
          {
            id: nanoid(8),
            tools: [
              toolBuilder<InputTool>({
                label: 'Name',
                type: 'input',
                value: 'Facebook',
              }),
              toolBuilder<InputTool>({
                label: 'Link',
                type: 'input',
                value: 'https://example',
              }),
              toolBuilder<ImageTool>({
                group: 'Logo',
                label: 'Image',
                type: 'image',
                value: {
                  src: facebook,
                  link: 'https://example.com',
                  alt: 'Some alt',
                  width: 16,
                  height: 16,
                },
              }),
            ],
          },
          {
            id: nanoid(8),
            tools: [
              toolBuilder<InputTool>({
                label: 'Name',
                type: 'input',
                value: 'Twitter',
              }),
              toolBuilder<InputTool>({
                label: 'Link',
                type: 'input',
                value: 'https://example',
              }),
              toolBuilder<ImageTool>({
                group: 'Logo',
                label: 'Image',
                type: 'image',
                value: {
                  src: twitter,
                  link: 'https://example.com',
                  alt: 'Some alt',
                  width: 16,
                  height: 16,
                },
              }),
            ],
          },
          {
            id: nanoid(8),
            tools: [
              toolBuilder<InputTool>({
                label: 'Name',
                type: 'input',
                value: 'Instagram',
              }),
              toolBuilder<InputTool>({
                label: 'Link',
                type: 'input',
                value: 'https://example',
              }),
              toolBuilder<ImageTool>({
                group: 'Logo',
                label: 'Image',
                type: 'image',
                value: {
                  src: instagram,
                  link: 'https://example.com',
                  alt: 'Some alt',
                  width: 16,
                  height: 16,
                },
              }),
            ],
          },
        ],
      }),
      toolBuilder<ToggleTool>({
        group: 'Menu',
        label: 'Show / Hide',
        type: 'toggle',
        value: true,
      }),
    ],
  }
}

const menu4: ComponentBuilder = (theme, label) => {
  const preview = theme === 'dark' ? images.components.menu4.dark : images.components.menu4.light
  const logo = theme === 'dark' ? images.logo.white : images.logo.black
  const bgColor = theme === 'dark' ? COLOR.theme.dark : COLOR.theme.light
  const linkColor = theme === 'dark' ? COLOR.theme.light : COLOR.theme.dark

  return {
    id: nanoid(8),
    name: 'Menu4',
    label,
    type: 'menu',
    preview,
    tools: [
      toolBuilder<PaddingTool>({
        group: 'Layout',
        label: 'Padding',
        type: 'padding',
        value: [30, 35, 30, 35],
      }),
      toolBuilder<ColorPickerTool>({
        group: 'Layout',
        label: 'Background Color',
        type: 'colorPicker',
        value: bgColor,
      }),
      toolBuilder<ImageTool>({
        group: 'Logo',
        label: 'Image',
        type: 'image',
        value: {
          src: logo,
          link: 'https://example.com',
          alt: 'Some alt',
          width: 110,
        },
      }),
      toolBuilder<ToggleTool>({
        group: 'Logo',
        label: 'Show / Hide',
        type: 'toggle',
        value: true,
      }),
      toolBuilder<MultiTool>({
        group: 'Menu',
        label: 'List',
        type: 'multi',
        value: [
          {
            id: nanoid(8),
            tools: [
              toolBuilder<InputTool>({
                label: 'Name',
                type: 'input',
                value: 'Specs',
              }),
              toolBuilder<InputTool>({
                label: 'Link',
                type: 'input',
                value: 'https://example',
              }),
              toolBuilder<ColorPickerTool>({
                label: 'Color',
                type: 'colorPicker',
                value: linkColor,
              }),
              toolBuilder<InputNumberTool>({
                label: 'Font Size',
                type: 'inputNumber',
                value: 16,
              }),
            ],
          },
          {
            id: nanoid(8),
            tools: [
              toolBuilder<InputTool>({
                label: 'Name',
                type: 'input',
                value: 'Feature',
              }),
              toolBuilder<InputTool>({
                label: 'Link',
                type: 'input',
                value: 'https://example',
              }),
              toolBuilder<ColorPickerTool>({
                label: 'Color',
                type: 'colorPicker',
                value: linkColor,
              }),
              toolBuilder<InputNumberTool>({
                label: 'Font Size',
                type: 'inputNumber',
                value: 16,
              }),
            ],
          },
          {
            id: nanoid(8),
            tools: [
              toolBuilder<InputTool>({
                label: 'Name',
                type: 'input',
                value: 'Price',
              }),
              toolBuilder<InputTool>({
                label: 'Link',
                type: 'input',
                value: 'https://example',
              }),
              toolBuilder<ColorPickerTool>({
                label: 'Color',
                type: 'colorPicker',
                value: linkColor,
              }),
              toolBuilder<InputNumberTool>({
                label: 'Font Size',
                type: 'inputNumber',
                value: 16,
              }),
            ],
          },
        ],
      }),
      toolBuilder<ToggleTool>({
        group: 'Menu',
        label: 'Show / Hide',
        type: 'toggle',
        value: true,
      }),
    ],
  }
}

export const menu = [
  menu1('dark', 'Menu 1'),
  menu2('dark', 'Menu 2'),
  menu3('dark', 'Menu 3'),
  menu4('dark', 'Menu 4'),
  menu1('light', 'Menu 5'),
  menu2('light', 'Menu 6'),
  menu3('light', 'Menu 7'),
  menu4('light', 'Menu 8'),
]
