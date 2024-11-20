<template>
  <el-card class="model-controls">
    <template #header>
      <div class="panel-header">
        <span>模型控制</span>
        <el-tag size="small" type="info">FBX模型</el-tag>
      </div>
    </template>
    
    <div class="control-content">
      <!-- 控制模块切换 -->
      <div class="module-selector">
        <el-radio-group v-model="activeModule" size="small">
          <el-radio-button label="basic">
            <el-icon><Tools /></el-icon>
            基础控制
          </el-radio-button>
          <el-radio-button label="render">
            <el-icon><Monitor /></el-icon>
            渲染设置
          </el-radio-button>
          <el-radio-button label="lights">
            <el-icon><Sunny /></el-icon>
            光源设置
          </el-radio-button>
        </el-radio-group>
      </div>

      <BasicControls
        v-if="activeModule === 'basic'"
        :scale="modelControls.scale"
        :is-playing="modelControls.isPlaying"
        @scale-change="$emit('scale-change', $event)"
        @start-animation="$emit('start-animation')"
        @pause-animation="$emit('pause-animation')"
        @reset-animation="$emit('reset-animation')"
      />

      <RenderControls
        v-if="activeModule === 'render'"
        @toggle-grid="$emit('toggle-grid', $event)"
        @toggle-stats="$emit('toggle-stats', $event)"
      />

      <LightControls
        v-if="activeModule === 'lights'"
        :lights="modelControls.lights"
        :onUpdateLight="updateLight"
      />

      <!-- 视图控制 -->
      <div class="view-controls">
        <el-button-group>
          <el-button @click="$emit('reset-camera')">
            <el-icon><RefreshRight /></el-icon>
            重置视角
          </el-button>
          <el-button @click="$emit('take-screenshot')">
            <el-icon><Camera /></el-icon>
            截图
          </el-button>
        </el-button-group>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import { Tools, Monitor, Sunny, RefreshRight, Camera } from '@element-plus/icons-vue'
import type { IModelControls } from '../types'
import BasicControls from './controls/BasicControls.vue'
import RenderControls from './controls/RenderControls.vue'
import LightControls from './controls/LightControls.vue'
import { LIGHTS_KEY } from '../hooks/useThreeScene'

defineProps<{
  modelControls: IModelControls
}>()

defineEmits<{
  (e: 'reset-camera'): void
  (e: 'take-screenshot'): void
  (e: 'start-animation'): void
  (e: 'pause-animation'): void
  (e: 'reset-animation'): void
  (e: 'toggle-grid', show: boolean): void
  (e: 'toggle-stats', show: boolean): void
  (e: 'scale-change', value: number): void
  (e: 'light-change', lightType: string, property: string, value: any): void
}>()

const activeModule = ref('basic')

// 注入 useThreeLights 实例
const lightUtils = inject(LIGHTS_KEY)
const updateLight = lightUtils?.updateLight
</script>

<style lang="scss" scoped>
.model-controls {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  height: calc(100vh - 140px);
  
  .panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .control-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    gap: 16px;
    
    .module-selector {
      :deep(.el-radio-group) {
        width: 100%;
        display: flex;
        
        .el-radio-button {
          flex: 1;
          
          .el-radio-button__inner {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 4px;
          }
        }
      }
    }
    
    .module-content {
      flex: 1;
      overflow: hidden;
      padding: 0 12px;
    }
    
    .view-controls {
      padding: 16px 0;
      border-top: 1px solid var(--el-border-color-lighter);
      text-align: center;
      
      .el-button-group {
        .el-button {
          .el-icon {
            margin-right: 4px;
          }
        }
      }
    }
  }
}

// 暗黑模式适配
:deep(html.dark) {
  .model-controls {
    background: rgba(0, 0, 0, 0.8);
  }
}
</style> 