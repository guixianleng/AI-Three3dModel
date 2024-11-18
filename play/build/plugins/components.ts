import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import type { PluginOption } from 'vite'

export function createComponentsPlugin(): PluginOption {
  return Components({
    resolvers: [ElementPlusResolver()],
    dts: 'src/types/components.d.ts',
  })
} 