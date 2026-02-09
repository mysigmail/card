/* eslint-disable node/prefer-global/process */
import path from 'node:path'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig, loadEnv } from 'vite'

const pathSrc = path.resolve(__dirname, './src')
const pathRoot = path.resolve(__dirname, './')

export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) }

  return defineConfig({
    base: process.env.VITE_APP_BASE_PATH || '/',
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
          unicons: FileSystemIconLoader('./node_modules/@iconscout/unicons/svg/line'),
        },
      }),
    ],
    resolve: {
      alias: {
        '#': pathRoot,
        '@': pathSrc,
      },
      dedupe: ['vue'],
    },
  })
}
