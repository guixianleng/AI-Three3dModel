<template>
  <el-card class="model-controls">
    <template #header>
      <div class="panel-header">
        <div class="title">
          <span>模型控制</span>
          <el-tag size="small" type="info">FBX模型</el-tag>
        </div>
        <div class="actions">
          <el-button-group>
            <el-button size="small" @click="$emit('reset-view')" title="重置视角">
              <el-icon><RefreshRight /></el-icon>
            </el-button>
            <el-button size="small" @click="$emit('take-screenshot')" title="截图">
              <el-icon><Camera /></el-icon>
            </el-button>
          </el-button-group>
        </div>
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
        @scale-change="handleScaleChange"
        @start-animation="$emit('start-animation')"
        @pause-animation="$emit('pause-animation')"
        @reset-animation="$emit('reset-animation')"
      />

      <RenderControls
        v-if="activeModule === 'render'"
        @toggle-grid="$emit('toggle-grid', $event)"
        @toggle-stats="$emit('toggle-stats', $event)"
        @toggle-axes="$emit('toggle-axes', $event)"
        @toggle-floor="$emit('toggle-floor', $event)"
        @update-floor-color="$emit('update-floor-color', $event)"
      />

      <LightControls
        v-if="activeModule === 'lights'"
        :lights="modelControls.lights"
        :onUpdateLight="updateLight"
      />
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import { Tools, Monitor, Sunny, RefreshRight, Camera } from '@element-plus/icons-vue'
import type { IModelControls } from '../types/controls'
import BasicControls from './controls/BasicControls.vue'
import RenderControls from './controls/RenderControls.vue'
import LightControls from './controls/LightControls.vue'
import { LIGHTS_KEY } from '../hooks/useThreeScene'

const props = defineProps<{
  modelControls: IModelControls
}>()

const emit = defineEmits<{
  (e: 'reset-view'): void
  (e: 'take-screenshot'): void
  (e: 'start-animation'): void
  (e: 'pause-animation'): void
  (e: 'reset-animation'): void
  (e: 'toggle-grid', show: boolean): void
  (e: 'toggle-stats', show: boolean): void
  (e: 'toggle-axes', show: boolean): void
  (e: 'scale-change', value: number): void
  (e: 'light-change', lightType: string, property: string, value: any): void
  (e: 'toggle-floor', show: boolean): void
  (e: 'update-floor-color', color: string): void
}>()

const activeModule = ref('basic')

// 注入 useThreeLights 实例
const lightUtils = inject(LIGHTS_KEY)
const updateLight = lightUtils?.updateLight

// 处理缩放变化
const handleScaleChange = (value: number) => {
  emit('scale-change', value)
}
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

    .title {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .actions {
      .el-button-group {
        .el-button {
          padding: 6px 12px;
          
          .el-icon {
            margin-right: 0;
          }

          &:hover {
            background-color: var(--el-color-primary-light-7);
            color: var(--el-color-primary);
          }
        }
      }
    }
  }

  .control-content {
    display: flex;
    flex-direction: column;
    height: calc(100% - 20px);
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
  }
}

// 暗黑模式适配
:deep(html.dark) {
  .model-controls {
    background: rgba(0, 0, 0, 0.8);
  }
}
</style> 