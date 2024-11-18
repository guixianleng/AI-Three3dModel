import type { PluginOption } from 'vite'

export function createDevPlugin(): PluginOption {
  return {
    name: 'vite-plugin-dev',
    // 开发环境特定配置
  }
} 