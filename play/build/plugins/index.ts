import type { PluginOption } from 'vite'
import { createVuePlugin } from './vue'
import { createUnocssPlugin } from './unocss'
import { createAutoImportPlugin } from './auto-import'
import { createComponentsPlugin } from './components'
import { createDevPlugin } from './dev'
import { createBuildPlugin } from './build'

export function createVitePlugins(isBuild: boolean): PluginOption[] {
  const vitePlugins: PluginOption[] = [
    createVuePlugin(),
    createUnocssPlugin(),
    createComponentsPlugin(),
    createAutoImportPlugin(),
  ]

  if (!isBuild) {
    vitePlugins.push(createDevPlugin())
  }

  if (isBuild) {
    vitePlugins.push(createBuildPlugin())
  }

  return vitePlugins
} 