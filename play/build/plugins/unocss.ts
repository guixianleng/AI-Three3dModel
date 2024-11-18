import UnoCSS from 'unocss/vite'
import type { PluginOption } from 'vite'

export function createUnocssPlugin(): PluginOption {
  return UnoCSS()
} 