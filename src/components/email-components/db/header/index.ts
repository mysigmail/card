import { nanoid } from 'nanoid'
import { images } from '../images'
import { toolBuilder } from '../../utils'
import { COLOR } from '../../constants'
import type {
  AlignTool,
  BackgroundImageTool,
  ColorPickerTool,
  ComponentBuilder,
  ImageTool,
  InputNumberTool,
  InputTool,
  MultiTool,
  SpacingTool,
  TextEditorTool,
  ToggleTool,
} from '@/types/editor'

const header1: ComponentBuilder = (_, label) => {
  return {
    id: nanoid(8),
    name: 'Header1',
    label,
    type: 'header',
    preview: images.components.header1,
    tools: [
      toolBuilder<SpacingTool>({
        group: 'Layout',
        label: 'Spacings',
        type: 'spacing',
        value: {
          padding: [30, 35, 30, 35],
        },
      }),
      toolBuilder<ColorPickerTool>({
        group: 'Layout',
        label: 'Background Color',
        type: 'colorPicker',
        value: COLOR.theme.dark,
      }),
      toolBuilder<BackgroundImageTool>({
        group: 'Layout',
        label: 'Background Image',
        type: 'bgImage',
        value: {
          url: '/img/josh-nuttall-pIwu5XNvXpk-unsplash.png',
          position: 'center',
          repeat: 'no-repeat',
          size: 'cover',
        },
      }),
      toolBuilder<AlignTool>({
        group: 'Logo',
        label: 'Align',
        type: 'align',
        value: 'left',
      }),
      toolBuilder<ImageTool>({
        group: 'Logo',
        label: 'Image',
        type: 'image',
        value: {
          src: images.logo.white,
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
      toolBuilder<AlignTool>({
        group: 'Menu',
        label: 'Align',
        type: 'align',
        value: 'right',
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
                value: COLOR.theme.light,
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
                value: COLOR.theme.light,
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
                value: COLOR.theme.light,
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
      toolBuilder<SpacingTool>({
        group: 'Text',
        label: 'Spacings',
        type: 'spacing',
        value: {
          margin: [50, 0, 0, 0],
          padding: [0, 0, 0, 0],
        },
      }),
      toolBuilder<ColorPickerTool>({
        group: 'Text',
        label: 'Main Color',
        type: 'colorPicker',
        value: COLOR.theme.light,
      }),
      toolBuilder<TextEditorTool>({
        group: 'Text',
        label: 'Content',
        type: 'textEditor',
        value:
          '<p><strong><span style="font-size: 18px">Unleash Freedom</span></strong></p><p><span style="color: rgb(159, 249, 141); font-size: 48px">Discover</span><span style="font-size: 48px"> the Unmatched Thrill with Our </span><span style="color: #9FF98D; font-size: 48px">New Bicycle</span></p>',
      }),
      toolBuilder<ToggleTool>({
        group: 'Text',
        label: 'Show / Hide',
        type: 'toggle',
        value: true,
      }),
    ],
  }
}

const header2: ComponentBuilder = (_, label) => {
  return {
    id: nanoid(8),
    name: 'Header2',
    label,
    type: 'header',
    preview: images.components.header2,
    tools: [
      toolBuilder<SpacingTool>({
        group: 'Layout',
        label: 'Spacings',
        type: 'spacing',
        value: {
          padding: [30, 35, 30, 35],
        },
      }),
      toolBuilder<ColorPickerTool>({
        group: 'Layout',
        label: 'Background Color',
        type: 'colorPicker',
        value: COLOR.theme.light,
      }),
      toolBuilder<AlignTool>({
        group: 'Logo',
        label: 'Align',
        type: 'align',
        value: 'left',
      }),
      toolBuilder<ImageTool>({
        group: 'Logo',
        label: 'Image',
        type: 'image',
        value: {
          src: images.logo.black,
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
      toolBuilder<AlignTool>({
        group: 'Menu',
        label: 'Align',
        type: 'align',
        value: 'right',
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
                value: COLOR.theme.dark,
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
                value: COLOR.theme.dark,
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
                value: COLOR.theme.dark,
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
      toolBuilder<SpacingTool>({
        group: 'Text',
        label: 'Spacings',
        type: 'spacing',
        value: {
          margin: [30, 0, 0, 0],
          padding: [140, 20, 20, 20],
        },
      }),
      toolBuilder<ColorPickerTool>({
        group: 'Text',
        label: 'Main Color',
        type: 'colorPicker',
        value: COLOR.theme.light,
      }),
      toolBuilder<TextEditorTool>({
        group: 'Text',
        label: 'Content',
        type: 'textEditor',
        value:
          '<p style="text-align: center"><span style="font-size: 18px">New Stool</span></p><p style="text-align: center"><span style="font-size: 36px"><u>Simplicity. Practicality. Naturality</u></span></p>',
      }),
      toolBuilder<BackgroundImageTool>({
        group: 'Text',
        label: 'Background Image',
        type: 'bgImage',
        value: {
          url: '/img/ruslan-bardash-4kTbAMRAHtQ-unsplash.png',
          position: 'top',
          repeat: 'no-repeat',
          size: 'cover',
        },
      }),
      toolBuilder<ToggleTool>({
        group: 'Text',
        label: 'Show / Hide',
        type: 'toggle',
        value: true,
      }),
    ],
  }
}

export const header = [header1('light', 'Header 1'), header2('light', 'Header 2')]
