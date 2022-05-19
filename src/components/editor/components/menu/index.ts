import type { ComponentBuilder } from '@/types/editor'
import { nanoid } from 'nanoid'
import { images } from '../../images'
import { THEME_COLOR } from '../constants'

const menu1: ComponentBuilder = (theme, label) => {
  const preview =
    theme === 'dark'
      ? images.components.menu1.dark
      : images.components.menu1.light
  const logo = theme === 'dark' ? images.logo.black : images.logo.white
  const bgColor = theme === 'dark' ? THEME_COLOR.dark : THEME_COLOR.light
  const linkColor = theme === 'dark' ? THEME_COLOR.light : THEME_COLOR.dark

  return {
    name: 'menu-1',
    label,
    type: 'menu',
    preview,
    tools: [
      // GENERAL
      {
        id: '1',
        group: 'General',
        label: 'Padding',
        type: 'padding',
        value: [30, 35, 30, 35]
      },
      {
        id: nanoid(8),
        group: 'General',
        label: 'Background Color',
        type: 'colorPicker',
        value: bgColor
      },
      // LOGO
      {
        id: nanoid(8),
        group: 'Logo',
        label: 'Container Width',
        type: 'inputNumber',
        value: 372
      },
      {
        id: nanoid(8),
        group: 'Logo',
        label: 'Image',
        type: 'image',
        value: {
          src: logo,
          link: 'https://example.com',
          alt: 'Some alt',
          width: 110
        }
      },
      {
        id: nanoid(8),
        group: 'Logo',
        label: 'Show / Hide',
        type: 'toggle',
        value: true
      },
      // MENU
      {
        id: nanoid(8),
        group: 'Menu',
        label: 'Container Width',
        type: 'inputNumber',
        value: null
      },
      {
        id: 'multi',
        group: 'Menu',
        label: 'List',
        type: 'multi',
        value: [
          // LIST
          {
            id: 'multi-value',
            label: 'Specs',
            type: 'multi',
            value: [
              {
                id: '2',
                label: 'Name',
                type: 'input',
                value: 'Specs',
                updateParentLabel: true
              },
              {
                id: nanoid(8),
                label: 'Link',
                type: 'input',
                value: 'https://example.com'
              },
              {
                id: nanoid(8),
                label: 'Text Color',
                type: 'colorPicker',
                value: linkColor
              },
              {
                id: nanoid(8),
                label: 'Size',
                type: 'inputNumber',
                value: 16
              }
            ]
          },
          {
            id: nanoid(8),
            label: 'Feature',
            type: 'multi',
            value: [
              {
                id: nanoid(8),
                label: 'Name',
                type: 'input',
                value: 'Feature',
                updateParentLabel: true
              },
              {
                id: nanoid(8),
                label: 'Link',
                type: 'input',
                value: 'https://example.com'
              },
              {
                id: nanoid(8),
                label: 'Text Color',
                type: 'colorPicker',
                value: linkColor
              },
              {
                id: nanoid(8),
                label: 'Size',
                type: 'inputNumber',
                value: 16
              }
            ]
          },
          {
            id: nanoid(8),
            label: 'Price',
            type: 'multi',
            value: [
              {
                id: nanoid(8),
                label: 'Name',
                type: 'input',
                value: 'Price',
                updateParentLabel: true
              },
              {
                id: nanoid(8),
                label: 'Link',
                type: 'input',
                value: 'https://example.com'
              },
              {
                id: nanoid(8),
                label: 'Text Color',
                type: 'colorPicker',
                value: linkColor
              },
              {
                id: nanoid(8),
                label: 'Size',
                type: 'inputNumber',
                value: 16
              }
            ]
          }
        ]
      },
      {
        id: nanoid(8),
        group: 'Menu',
        label: 'Show / Hide',
        type: 'toggle',
        value: true
      }
    ]
  }
}

export const menu = [menu1('light', 'Menu 1'), menu1('dark', 'Menu 2')]
