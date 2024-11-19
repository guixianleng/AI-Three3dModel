import { defineConfig } from 'vite'
import { resolve } from 'path'
import { createVitePlugins } from './build/plugins'

export default defineConfig(({ command }) => {
  const isBuild = command === 'build'
  
  return {
    plugins: createVitePlugins(isBuild),
    resolve: {
      alias: {
        '@': resolve(__dirname, './src')
      }
    },
    server: {
      port: 9527
    },
    optimizeDeps: {
      include: [
        'vue',
        'element-plus',
        '@element-plus/icons-vue',
        'three'
      ]
    }
  }
}) 