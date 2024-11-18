import vue from '@vitejs/plugin-vue'
import type { PluginOption } from 'vite'

export function createVuePlugin(): PluginOption {
  return vue()
} 