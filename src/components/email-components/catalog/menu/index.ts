import { nanoid } from 'nanoid'
import { images } from '@/components/email-components/catalog/images'
import { COLOR } from '@/components/email-components/constants'
import { f } from '@/components/email-components/fields'
import { defineEmailBlockSchema } from '@/components/email-components/schema/types'
import type { SchemaGroupFields } from '@/components/email-components/schema/types'
import type { ComponentBuilder } from '@/types/editor'

interface MenuSchemaModel {
  Layout: SchemaGroupFields<'attrs'>
  Logo: SchemaGroupFields<'show' | 'attrs' | 'link' | 'align' | 'padding'>
  Menu: SchemaGroupFields<'show' | 'items' | 'align' | 'padding'>
  Divider: SchemaGroupFields<'show' | 'color' | 'padding'>
  Social: SchemaGroupFields<'show' | 'items' | 'align'>
}

const menuRootSchema = {
  attrs: 'Layout.attrs',
  clickGroup: 'Layout',
} as const

const menu1Schema = defineEmailBlockSchema<MenuSchemaModel>({
  root: menuRootSchema,
  nodes: [
    {
      type: 'row',
      children: [
        {
          type: 'logo',
          group: 'Logo',
          if: 'Logo.show',
          attrs: 'Logo.attrs',
          link: 'Logo.link',
          align: 'Logo.align',
        },
        {
          type: 'menu',
          group: 'Menu',
          if: 'Menu.show',
          items: 'Menu.items',
          align: 'Menu.align',
        },
      ],
    },
  ],
})

const menu2Schema = defineEmailBlockSchema<MenuSchemaModel>({
  root: menuRootSchema,
  nodes: [
    {
      type: 'row',
      styleBindings: {
        padding: 'Logo.padding',
      },
      children: [
        {
          type: 'logo',
          group: 'Logo',
          if: 'Logo.show',
          attrs: 'Logo.attrs',
          link: 'Logo.link',
          align: 'Logo.align',
        },
      ],
    },
    {
      type: 'divider',
      if: 'Divider.show',
      group: 'Divider',
      color: 'Divider.color',
      styleBindings: {
        padding: 'Divider.padding',
      },
    },
    {
      type: 'row',
      styleBindings: {
        padding: 'Menu.padding',
      },
      children: [
        {
          type: 'menu',
          group: 'Menu',
          if: 'Menu.show',
          items: 'Menu.items',
          align: 'Menu.align',
        },
      ],
    },
  ],
})

const menu3Schema = defineEmailBlockSchema<MenuSchemaModel>({
  root: menuRootSchema,
  nodes: [
    {
      type: 'row',
      children: [
        {
          type: 'logo',
          group: 'Logo',
          if: 'Logo.show',
          attrs: 'Logo.attrs',
          link: 'Logo.link',
          align: 'Logo.align',
        },
        {
          type: 'social',
          group: 'Social',
          if: 'Social.show',
          items: 'Social.items',
          align: 'Social.align',
        },
      ],
    },
  ],
})

const menu4Schema = defineEmailBlockSchema<MenuSchemaModel>({
  root: menuRootSchema,
  nodes: [
    {
      type: 'row',
      styleBindings: {
        padding: 'Logo.padding',
      },
      children: [
        {
          type: 'logo',
          group: 'Logo',
          if: 'Logo.show',
          attrs: 'Logo.attrs',
          link: 'Logo.link',
          align: 'Logo.align',
        },
      ],
    },
    {
      type: 'row',
      styleBindings: {
        padding: 'Menu.padding',
      },
      children: [
        {
          type: 'menu',
          group: 'Menu',
          if: 'Menu.show',
          items: 'Menu.items',
          align: 'Menu.align',
        },
      ],
    },
  ],
})

function menuItems(color: string) {
  return [
    f.menuItem({
      name: 'Specs',
      link: 'https://example',
      color,
      fontSize: 16,
    }),
    f.menuItem({
      name: 'Feature',
      link: 'https://example',
      color,
      fontSize: 16,
    }),
    f.menuItem({
      name: 'Price',
      link: 'https://example',
      color,
      fontSize: 16,
    }),
  ]
}

function socialItems(facebook: string, twitter: string, instagram: string) {
  return [
    f.socialItem({
      name: 'Facebook',
      link: 'https://example',
      image: {
        src: facebook,
        link: 'https://example.com',
        alt: 'Some alt',
        width: 16,
        height: 16,
      },
    }),
    f.socialItem({
      name: 'Twitter',
      link: 'https://example',
      image: {
        src: twitter,
        link: 'https://example.com',
        alt: 'Some alt',
        width: 16,
        height: 16,
      },
    }),
    f.socialItem({
      name: 'Instagram',
      link: 'https://example',
      image: {
        src: instagram,
        link: 'https://example.com',
        alt: 'Some alt',
        width: 16,
        height: 16,
      },
    }),
  ]
}

const menu1: ComponentBuilder = (theme, label) => {
  const preview = theme === 'dark' ? images.components.menu1.dark : images.components.menu1.light
  const logo = theme === 'dark' ? images.logo.white : images.logo.black
  const backgroundColor = theme === 'dark' ? COLOR.theme.dark : COLOR.theme.light
  const linkColor = theme === 'dark' ? COLOR.theme.light : COLOR.theme.dark

  return {
    id: nanoid(8),
    name: 'Menu1',
    label,
    schema: menu1Schema,
    type: 'menu',
    preview,
    tools: [
      f.padding({
        group: 'Layout',
        value: [30, 35, 30, 35],
      }),
      f.backgroundColor({
        group: 'Layout',
        value: backgroundColor,
      }),
      f.align({
        group: 'Logo',
        value: 'left',
      }),
      f.image({
        group: 'Logo',
        value: {
          src: logo,
          link: 'https://example.com',
          alt: 'Some alt',
          width: 110,
        },
      }),
      f.showHide({
        group: 'Logo',
      }),
      f.align({
        group: 'Menu',
        value: 'right',
      }),
      f.list({
        group: 'Menu',
        value: menuItems(linkColor),
      }),
      f.showHide({
        group: 'Menu',
      }),
    ],
  }
}

const menu2: ComponentBuilder = (theme, label) => {
  const preview = theme === 'dark' ? images.components.menu2.dark : images.components.menu2.light
  const logo = theme === 'dark' ? images.logo.white : images.logo.black
  const backgroundColor = theme === 'dark' ? COLOR.theme.dark : COLOR.theme.light
  const linkColor = theme === 'dark' ? COLOR.theme.light : COLOR.theme.dark
  const dividerColor = theme === 'dark' ? COLOR.divider.light : COLOR.divider.dark

  return {
    id: nanoid(8),
    name: 'Menu2',
    label,
    schema: menu2Schema,
    type: 'menu',
    preview,
    tools: [
      f.padding({
        group: 'Layout',
        value: [30, 35, 30, 35],
      }),
      f.backgroundColor({
        group: 'Layout',
        value: backgroundColor,
      }),
      f.padding({
        group: 'Divider',
        value: [10, 0, 10, 0],
      }),
      f.color({
        group: 'Divider',
        value: dividerColor,
      }),
      f.showHide({
        group: 'Divider',
      }),
      f.padding({
        group: 'Logo',
        value: [0, 0, 0, 0],
      }),
      f.align({
        group: 'Logo',
        value: 'center',
      }),
      f.image({
        group: 'Logo',
        value: {
          src: logo,
          link: 'https://example.com',
          alt: 'Some alt',
          width: 110,
        },
      }),
      f.showHide({
        group: 'Logo',
      }),
      f.padding({
        group: 'Menu',
        value: [0, 0, 0, 0],
      }),
      f.align({
        group: 'Menu',
        value: 'center',
      }),
      f.list({
        group: 'Menu',
        value: menuItems(linkColor),
      }),
      f.showHide({
        group: 'Menu',
      }),
    ],
  }
}

const menu3: ComponentBuilder = (theme, label) => {
  const preview = theme === 'dark' ? images.components.menu3.dark : images.components.menu3.light
  const logo = theme === 'dark' ? images.logo.white : images.logo.black
  const backgroundColor = theme === 'dark' ? COLOR.theme.dark : COLOR.theme.light
  const facebook = theme === 'dark' ? images.socials.facebook.white : images.socials.facebook.black
  const twitter = theme === 'dark' ? images.socials.twitter.white : images.socials.twitter.black
  const instagram
    = theme === 'dark' ? images.socials.instagram.white : images.socials.instagram.black

  return {
    id: nanoid(8),
    name: 'Menu3',
    label,
    schema: menu3Schema,
    type: 'menu',
    preview,
    tools: [
      f.padding({
        group: 'Layout',
        value: [30, 35, 30, 35],
      }),
      f.backgroundColor({
        group: 'Layout',
        value: backgroundColor,
      }),
      f.align({
        group: 'Logo',
        value: 'left',
      }),
      f.image({
        group: 'Logo',
        value: {
          src: logo,
          link: 'https://example.com',
          alt: 'Some alt',
          width: 110,
        },
      }),
      f.showHide({
        group: 'Logo',
      }),
      f.align({
        group: 'Social',
        value: 'right',
      }),
      f.list({
        group: 'Social',
        value: socialItems(facebook, twitter, instagram),
      }),
      f.showHide({
        group: 'Social',
      }),
    ],
  }
}

const menu4: ComponentBuilder = (theme, label) => {
  const preview = theme === 'dark' ? images.components.menu4.dark : images.components.menu4.light
  const logo = theme === 'dark' ? images.logo.white : images.logo.black
  const backgroundColor = theme === 'dark' ? COLOR.theme.dark : COLOR.theme.light
  const linkColor = theme === 'dark' ? COLOR.theme.light : COLOR.theme.dark

  return {
    id: nanoid(8),
    name: 'Menu4',
    label,
    schema: menu4Schema,
    type: 'menu',
    preview,
    tools: [
      f.padding({
        group: 'Layout',
        value: [30, 35, 30, 35],
      }),
      f.backgroundColor({
        group: 'Layout',
        value: backgroundColor,
      }),
      f.padding({
        group: 'Logo',
        value: [0, 0, 0, 0],
      }),
      f.align({
        group: 'Logo',
        value: 'left',
      }),
      f.image({
        group: 'Logo',
        value: {
          src: logo,
          link: 'https://example.com',
          alt: 'Some alt',
          width: 110,
        },
      }),
      f.showHide({
        group: 'Logo',
      }),
      f.padding({
        group: 'Menu',
        value: [20, 0, 0, 0],
      }),
      f.align({
        group: 'Menu',
        value: 'left',
      }),
      f.list({
        group: 'Menu',
        value: menuItems(linkColor),
      }),
      f.showHide({
        group: 'Menu',
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
