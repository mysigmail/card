import { nanoid } from 'nanoid'
import { images } from '../images'
import { THEME_COLOR } from '../../constants'
import { toolBuilder } from '../../utils'
import type { ColorPickerTool, ComponentBuilder, ImageTool, InputNumberTool, InputTool, MultiTool, PaddingTool } from '@/types/editor'

const menu1: ComponentBuilder = (theme, label) => {
  const preview
    = theme === 'dark'
      ? images.components.menu1.dark
      : images.components.menu1.light
  const logo = theme === 'dark' ? images.logo.white : images.logo.black
  const bgColor = theme === 'dark' ? THEME_COLOR.dark : THEME_COLOR.light
  const linkColor = theme === 'dark' ? THEME_COLOR.light : THEME_COLOR.dark

  return {
    id: nanoid(8),
    name: 'Menu1',
    label,
    type: 'menu',
    preview,
    tools: [
      toolBuilder<PaddingTool>({
        group: 'General',
        label: 'Padding',
        type: 'padding',
        value: [30, 35, 30, 35],
      }),
      toolBuilder<ColorPickerTool>({
        group: 'General',
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
                label: 'Text Color',
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
                label: 'Text Color',
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
                label: 'Text Color',
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
    ],
  }
}

export const menu = [menu1('light', 'Menu 1'), menu1('dark', 'Menu 2')]
