<template>
  <div class="model-controls-wrapper">
    <el-card v-show="visible" class="model-controls">
      <template #header>
        <div class="panel-header">
          <div class="title">
            <span>模型控制</span>
            <el-tag size="small" type="info">3D模型</el-tag>
          </div>
          <div class="actions">
            <el-button-group>
              <el-button size="small" title="重置视角" @click="sceneEvents?.resetView()">
                <el-icon><RefreshRight /></el-icon>
              </el-button>
              <el-button size="small" title="截图" @click="sceneEvents?.takeScreenshot()">
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
            <el-radio-button value="basic">
              <el-icon><Tools /></el-icon>
              基础控制
            </el-radio-button>
            <el-radio-button value="render">
              <el-icon><Monitor /></el-icon>
              渲染设置
            </el-radio-button>
            <el-radio-button value="lights">
              <el-icon><Sunny /></el-icon>
              光源设置
            </el-radio-button>
            <el-radio-button value="materials">
              <el-icon><Brush /></el-icon>
              材质设置
            </el-radio-button>
          </el-radio-group>
        </div>

        <BasicControls
          v-show="activeModule === 'basic'"
          :scale="modelControls.scale"
          :is-playing="modelControls.isPlaying"
        />

        <RenderControls v-show="activeModule === 'render'" />

        <LightControls v-show="activeModule === 'lights'" :lights="modelControls.lights" />

        <MaterialControls
          v-show="activeModule === 'materials'"
          :material-list="modelControls.materials"
          @update-material="handleMaterialUpdate"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import {
  Tools,
  Monitor,
  Sunny,
  RefreshRight,
  Camera,
  Setting,
  Close,
  Brush,
} from '@element-plus/icons-vue'
import type { IModelControls } from '../types/controls'
import type { SceneEvents } from '../config/eventKeys'
import { SCENE_EVENTS_KEY } from '../config/eventKeys'
import BasicControls from './controls/BasicControls.vue'
import RenderControls from './controls/RenderControls.vue'
import LightControls from './controls/LightControls.vue'
import MaterialControls from './controls/MaterialControls.vue'

defineProps<{
  modelControls: IModelControls
}>()

const activeModule = ref('basic')
const sceneEvents = inject<SceneEvents>(SCENE_EVENTS_KEY)
const visible = ref(true)

const toggleVisible = () => {
  visible.value = !visible.value
}

// 处理材质更新
const handleMaterialUpdate = (name: string, property: string, value: any) => {
  sceneEvents?.updateMaterial({ name, property, value })
}
</script>

<style lang="scss" scoped>
.model-controls-wrapper {
  position: relative;
  height: 100%;
  width: 100%;

  .model-controls {
    width: 100%;
    height: 100%;

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
          }
        }
      }
    }

    .module-selector {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
    }
  }
}
</style>
