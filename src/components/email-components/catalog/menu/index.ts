import type { SchemaGroupFields } from '@/components/email-components/schema/types'
import type { ComponentBuilder } from '@/types/editor'
import { nanoid } from 'nanoid'
import { images } from '@/components/email-components/catalog/images'
import { COLOR } from '@/components/email-components/constants'
import { f } from '@/components/email-components/fields'
import { createSchemaGroups, gp } from '@/components/email-components/schema/groups'
import { defineEmailBlockSchema } from '@/components/email-components/schema/types'

interface MenuSchemaModel {
  layout: SchemaGroupFields<'attrs'>
  logo: SchemaGroupFields<'show' | 'attrs' | 'link' | 'align' | 'padding' | 'width'>
  menu: SchemaGroupFields<'show' | 'items' | 'align' | 'padding' | 'width'>
  divider: SchemaGroupFields<'show' | 'color' | 'padding'>
  social: SchemaGroupFields<'show' | 'items' | 'align' | 'width'>
}

const groupBuilder = createSchemaGroups()
const groups = {
  layout: groupBuilder.group('layout', { id: 'layout', label: 'Layout' }),
  logo: groupBuilder.group('logo', { id: 'logo', label: 'Logo' }),
  menu: groupBuilder.group('menu', { id: 'menu', label: 'Menu' }),
  divider: groupBuilder.group('divider', { id: 'divider', label: 'Divider' }),
  social: groupBuilder.group('social', { id: 'social', label: 'Social' }),
} as const

const menuRootSchema = {
  attrs: gp(groups.layout, 'attrs'),
  clickGroup: groups.layout.id,
} as const

const menu1Schema = defineEmailBlockSchema<MenuSchemaModel>({
  root: menuRootSchema,
  nodes: [
    {
      type: 'row',
      children: [
        {
          type: 'logo',
          group: groups.logo.id,
          if: gp(groups.logo, 'show'),
          attrs: gp(groups.logo, 'attrs'),
          link: gp(groups.logo, 'link'),
          align: gp(groups.logo, 'align'),
          width: gp(groups.logo, 'width'),
        },
        {
          type: 'menu',
          group: groups.menu.id,
          if: gp(groups.menu, 'show'),
          items: gp(groups.menu, 'items'),
          align: gp(groups.menu, 'align'),
          width: gp(groups.menu, 'width'),
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
        padding: gp(groups.logo, 'padding'),
      },
      children: [
        {
          type: 'logo',
          group: groups.logo.id,
          if: gp(groups.logo, 'show'),
          attrs: gp(groups.logo, 'attrs'),
          link: gp(groups.logo, 'link'),
          align: gp(groups.logo, 'align'),
        },
      ],
    },
    {
      type: 'divider',
      if: gp(groups.divider, 'show'),
      group: groups.divider.id,
      color: gp(groups.divider, 'color'),
      styleBindings: {
        padding: gp(groups.divider, 'padding'),
      },
    },
    {
      type: 'row',
      styleBindings: {
        padding: gp(groups.menu, 'padding'),
      },
      children: [
        {
          type: 'menu',
          group: groups.menu.id,
          if: gp(groups.menu, 'show'),
          items: gp(groups.menu, 'items'),
          align: gp(groups.menu, 'align'),
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
          group: groups.logo.id,
          if: gp(groups.logo, 'show'),
          attrs: gp(groups.logo, 'attrs'),
          link: gp(groups.logo, 'link'),
          align: gp(groups.logo, 'align'),
          width: gp(groups.logo, 'width'),
        },
        {
          type: 'social',
          group: groups.social.id,
          if: gp(groups.social, 'show'),
          items: gp(groups.social, 'items'),
          align: gp(groups.social, 'align'),
          width: gp(groups.social, 'width'),
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
        padding: gp(groups.logo, 'padding'),
      },
      children: [
        {
          type: 'logo',
          group: groups.logo.id,
          if: gp(groups.logo, 'show'),
          attrs: gp(groups.logo, 'attrs'),
          link: gp(groups.logo, 'link'),
          align: gp(groups.logo, 'align'),
        },
      ],
    },
    {
      type: 'row',
      styleBindings: {
        padding: gp(groups.menu, 'padding'),
      },
      children: [
        {
          type: 'menu',
          group: groups.menu.id,
          if: gp(groups.menu, 'show'),
          items: gp(groups.menu, 'items'),
          align: gp(groups.menu, 'align'),
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
        group: groups.layout,
        value: [30, 35, 30, 35],
      }),
      f.backgroundColor({
        group: groups.layout,
        value: backgroundColor,
      }),
      f.align({
        group: groups.logo,
        value: 'left',
      }),
      f.columnWidth({
        group: groups.logo,
        value: 35,
      }),
      f.image({
        group: groups.logo,
        value: {
          src: logo,
          link: 'https://example.com',
          alt: 'Some alt',
          width: 110,
        },
      }),
      f.showHide({
        group: groups.logo,
      }),
      f.align({
        group: groups.menu,
        value: 'right',
      }),
      f.columnWidth({
        group: groups.menu,
        value: 65,
      }),
      f.list({
        group: groups.menu,
        value: menuItems(linkColor),
      }),
      f.showHide({
        group: groups.menu,
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
        group: groups.layout,
        value: [30, 35, 30, 35],
      }),
      f.backgroundColor({
        group: groups.layout,
        value: backgroundColor,
      }),
      f.padding({
        group: groups.divider,
        value: [10, 0, 10, 0],
      }),
      f.color({
        group: groups.divider,
        value: dividerColor,
      }),
      f.showHide({
        group: groups.divider,
      }),
      f.padding({
        group: groups.logo,
        value: [0, 0, 0, 0],
      }),
      f.align({
        group: groups.logo,
        value: 'center',
      }),
      f.image({
        group: groups.logo,
        value: {
          src: logo,
          link: 'https://example.com',
          alt: 'Some alt',
          width: 110,
        },
      }),
      f.showHide({
        group: groups.logo,
      }),
      f.padding({
        group: groups.menu,
        value: [0, 0, 0, 0],
      }),
      f.align({
        group: groups.menu,
        value: 'center',
      }),
      f.list({
        group: groups.menu,
        value: menuItems(linkColor),
      }),
      f.showHide({
        group: groups.menu,
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
        group: groups.layout,
        value: [30, 35, 30, 35],
      }),
      f.backgroundColor({
        group: groups.layout,
        value: backgroundColor,
      }),
      f.align({
        group: groups.logo,
        value: 'left',
      }),
      f.columnWidth({
        group: groups.logo,
        value: 35,
      }),
      f.image({
        group: groups.logo,
        value: {
          src: logo,
          link: 'https://example.com',
          alt: 'Some alt',
          width: 110,
        },
      }),
      f.showHide({
        group: groups.logo,
      }),
      f.align({
        group: groups.social,
        value: 'right',
      }),
      f.columnWidth({
        group: groups.social,
        value: 65,
      }),
      f.list({
        group: groups.social,
        value: socialItems(facebook, twitter, instagram),
      }),
      f.showHide({
        group: groups.social,
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
        group: groups.layout,
        value: [30, 35, 30, 35],
      }),
      f.backgroundColor({
        group: groups.layout,
        value: backgroundColor,
      }),
      f.padding({
        group: groups.logo,
        value: [0, 0, 0, 0],
      }),
      f.align({
        group: groups.logo,
        value: 'left',
      }),
      f.image({
        group: groups.logo,
        value: {
          src: logo,
          link: 'https://example.com',
          alt: 'Some alt',
          width: 110,
        },
      }),
      f.showHide({
        group: groups.logo,
      }),
      f.padding({
        group: groups.menu,
        value: [20, 0, 0, 0],
      }),
      f.align({
        group: groups.menu,
        value: 'left',
      }),
      f.list({
        group: groups.menu,
        value: menuItems(linkColor),
      }),
      f.showHide({
        group: groups.menu,
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
