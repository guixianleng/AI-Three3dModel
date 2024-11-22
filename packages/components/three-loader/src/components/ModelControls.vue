<template>
  <div class="model-controls-wrapper">
    <!-- 隐藏按钮 -->
    <div class="hide-button" :class="{ 'panel-hidden': !visible }">
      <el-button
        circle
        type="primary"
        size="small"
        :title="visible ? '隐藏配置面板' : '显示配置面板'"
        @click="toggleVisible"
      >
        <el-icon>
          <Close v-if="visible" />
          <Setting v-else />
        </el-icon>
      </el-button>
    </div>

    <el-card v-show="visible" class="model-controls">
      <template #header>
        <div class="panel-header">
          <div class="title">
            <span>模型控制</span>
            <el-tag size="small" type="info">FBX模型</el-tag>
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
          </el-radio-group>
        </div>

        <BasicControls
          v-show="activeModule === 'basic'"
          :scale="modelControls.scale"
          :is-playing="modelControls.isPlaying"
        />

        <RenderControls v-show="activeModule === 'render'" />

        <LightControls v-show="activeModule === 'lights'" :lights="modelControls.lights" />
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
} from '@element-plus/icons-vue'
import type { IModelControls } from '../types/controls'
import type { SceneEvents } from '../config/eventKeys'
import { SCENE_EVENTS_KEY } from '../config/eventKeys'
import BasicControls from './controls/BasicControls.vue'
import RenderControls from './controls/RenderControls.vue'
import LightControls from './controls/LightControls.vue'

defineProps<{
  modelControls: IModelControls
}>()

const activeModule = ref('basic')
const sceneEvents = inject<SceneEvents>(SCENE_EVENTS_KEY)
const visible = ref(true)

const toggleVisible = () => {
  visible.value = !visible.value
}
</script>

<style lang="scss" scoped>
.model-controls-wrapper {
  position: relative;
  height: 100%;
  width: 100%;

  .hide-button {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    left: -32px;
    z-index: 101;
    transition: all 0.5s ease;

    &.panel-hidden {
      position: absolute;
      left: auto;
      right: 0;
    }

    .el-button {
      width: 32px;
      height: 32px;
      padding: 0;
      border: none;
      border-radius: 4px 0 0 4px;
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
      background-color: var(--el-color-primary);
      color: #fff;

      &:hover {
        transform: translateX(-4px);
      }

      .el-icon {
        font-size: 16px;
      }
    }
  }

  .model-controls {
    width: 100%;
    height: 100%;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

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

    .module-selector {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .control-content {
      display: flex;
      flex-direction: column;
      height: calc(100% - 20px);
      gap: 12px;
    }
  }
}
</style>
