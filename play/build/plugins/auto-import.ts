import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import type { PluginOption } from 'vite'

export function createAutoImportPlugin(): PluginOption {
  return AutoImport({
    resolvers: [ElementPlusResolver()],
    imports: ['vue'],
    dts: 'src/types/auto-imports.d.ts',
  })
} 