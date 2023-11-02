import path from 'node:path'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Icons from 'unplugin-icons/vite'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'

const pathSrc = path.resolve(__dirname, './src')

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      dts: `${pathSrc}/types/auto-imports.d.ts`,
    }),
    Components({
      dts: `${pathSrc}/types/components.d.ts`,
      resolvers: [
        ElementPlusResolver(),
        IconsResolver({
          prefix: '',
          customCollections: ['svg', 'unicons'],
        }),
      ],
      dirs: ['src/layouts', 'src/components'],
    }),
    Icons({
      customCollections: {
        svg: FileSystemIconLoader('./src/assets/svg'),
        unicons: FileSystemIconLoader(
          './node_modules/@iconscout/unicons/svg/line',
        ),
      },
    }),
  ],
  resolve: {
    alias: {
      '@': pathSrc,
    },
    dedupe: [
      'vue',
    ],
  },
})
