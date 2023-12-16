import { Extension } from '@tiptap/vue-3'

declare module '@tiptap/vue-3' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (fontSize: number) => ReturnType
      unsetFontSize: () => ReturnType
    }
  }
}

export const FontSize = Extension.create({
  name: 'fontSize',

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
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: (attributes) => {
              if (!attributes.fontSize)
                return {}

              return {
                style: `font-size: ${attributes.fontSize}`,
              }
            },
          },
        },
      },
    ]
  },

  addCommands() {
    return {
      setFontSize:
        (fontSize: number) =>
          ({ chain }) => {
            return chain()
              .setMark('textStyle', { fontSize: `${fontSize}px` })
              .run()
          },
      unsetFontSize:
        () =>
          ({ chain }) => {
            return chain().setMark('textStyle', { fontSize: null }).run()
          },
    }
  },
})
