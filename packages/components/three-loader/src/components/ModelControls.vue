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
            <el-button size="small" @click="sceneEvents?.resetView()" title="重置视角">
              <el-icon><RefreshRight /></el-icon>
            </el-button>
            <el-button size="small" @click="sceneEvents?.takeScreenshot()" title="截图">
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
      />

      <RenderControls v-if="activeModule === 'render'" />

      <LightControls
        v-if="activeModule === 'lights'"
        :lights="modelControls.lights"
      />
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import { Tools, Monitor, Sunny, RefreshRight, Camera } from '@element-plus/icons-vue'
import type { IModelControls } from '../types/controls'
import type { SceneEvents } from '../config/eventKeys'
import { SCENE_EVENTS_KEY } from '../config/eventKeys'
import BasicControls from './controls/BasicControls.vue'
import RenderControls from './controls/RenderControls.vue'
import LightControls from './controls/LightControls.vue'

const props = defineProps<{
  modelControls: IModelControls
}>()

const activeModule = ref('basic')
const sceneEvents = inject<SceneEvents>(SCENE_EVENTS_KEY)
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