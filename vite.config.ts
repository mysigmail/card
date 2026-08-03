/* eslint-disable node/prefer-global/process */
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import { FileSystemIconLoader } from 'unplugin-icons/loaders'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'
import Components from 'unplugin-vue-components/vite'
import { defineConfig, loadEnv } from 'vite'

const pathRoot = path.dirname(fileURLToPath(import.meta.url))
const pathSrc = path.resolve(pathRoot, 'src')

export default ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, pathRoot) }

  return defineConfig({
    base: process.env.VITE_APP_BASE_PATH || '/',
    plugins: [
      tailwindcss(),
      vue({
        template: {
          compilerOptions: {
            isCustomElement: tag => tag === 'hex-color-picker',
          },
        },
      }),
      AutoImport({
        dts: `${pathSrc}/types/auto-imports.d.ts`,
      }),
      Components({
        dts: `${pathSrc}/types/components.d.ts`,
        resolvers: [
          IconsResolver({
            prefix: '',
            customCollections: ['svg'],
          }),
        ],
        dirs: [
          path.resolve(pathSrc, 'layouts'),
          path.resolve(pathSrc, 'features'),
          path.resolve(pathSrc, 'shared/ui'),
        ],
      }),
      Icons({
        customCollections: {
          svg: FileSystemIconLoader(path.resolve(pathSrc, 'assets/svg')),
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
