import type { PluginOption } from 'vite'

export function createBuildPlugin(): PluginOption {
  return {
    name: 'vite-plugin-build',
    // 生产环境特定配置
  }
} 