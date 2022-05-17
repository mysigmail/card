import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import IconsResolver from 'unplugin-icons/resolver'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Icons from 'unplugin-icons/vite'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'
import path from 'path'

const pathSrc = path.resolve(__dirname, './src')

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
      dts: `${pathSrc}/types/auto-imports.d.ts`
    }),
    Components({
      dts: `${pathSrc}/types/components.d.ts`,
      resolvers: [
        ElementPlusResolver(),
        IconsResolver({
          prefix: '',
          customCollections: ['svg']
        })
      ],
      dirs: ['src/layouts', 'src/components']
    }),
    Icons({
      customCollections: {
        svg: FileSystemIconLoader('./src/assets/svg')
      }
    })
  ],
  resolve: {
    alias: {
      '@': pathSrc
    }
  }
})
