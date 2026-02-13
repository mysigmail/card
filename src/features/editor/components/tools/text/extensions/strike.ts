import { Extension } from '@tiptap/vue-3'

declare module '@tiptap/vue-3' {
  interface Commands<ReturnType> {
    customStrike: {
      setCustomStrike: () => ReturnType
      unsetCustomStrike: () => ReturnType
    }
  }
}

export const Strike = Extension.create({
  name: 'customStrike',

  addOptions() {
    return {
      types: ['textStyle'],
    }
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          textDecoration: {
            default: null,
            parseHTML: element => element.style.textDecoration.includes('line-through'),
            renderHTML: (attributes) => {
              if (!attributes.textDecoration)
                return {}

              return {
                style: 'text-decoration: line-through',
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setCustomStrike:
        () =>
          ({ chain }) => {
            return chain().setMark('textStyle', { textDecoration: 'line-through' }).run()
          },
      unsetCustomStrike:
        () =>
          ({ chain }) => {
            return chain().setMark('textStyle', { textDecoration: null }).run()
          },
    }
  },
})
