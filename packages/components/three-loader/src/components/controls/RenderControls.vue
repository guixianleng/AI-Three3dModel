<template>
  <div class="control-sections">
    <div class="control-section">
      <div class="section-header">
        <el-icon><Monitor /></el-icon>
        <span>辅助工具</span>
      </div>
      <div class="section-content">
        <div class="control-item">
          <div class="control-content render-controls">
            <!-- 网格模块 -->
            <div class="render-group">
              <div class="render-option">
                <span>网格辅助线</span>
                <el-switch v-model="gridOptions.show" @change="sceneEvents?.toggleGrid" />
              </div>
              <div v-if="gridOptions.show" class="render-option">
                <span>网格颜色</span>
                <el-color-picker
                  v-model="gridOptions.color"
                  show-alpha
                  size="small"
                  :predefine="predefineColors"
                  @change="handleGridColorChange"
                />
              </div>
            </div>

            <!-- 坐标轴模块 -->
            <div class="render-group">
              <div class="render-option">
                <el-tooltip
                  content="X轴-红色 | Y轴-绿色 | Z轴-蓝色"
                  placement="top"
                  :show-after="200"
                >
                  <div class="axes-label">
                    <span>坐标轴辅助线</span>
                    <el-icon class="info-icon"><InfoFilled /></el-icon>
                  </div>
                </el-tooltip>
                <el-switch v-model="axesOptions.show" @change="sceneEvents?.toggleAxes" />
              </div>
            </div>

            <!-- 性能监控模块 -->
            <div class="render-group">
              <div class="render-option">
                <span>性能监控</span>
                <el-switch v-model="statsOptions.show" @change="sceneEvents?.toggleStats" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="control-section">
      <div class="section-header">
        <el-icon><Position /></el-icon>
        <span>模型位置</span>
        <div class="reset-link" @click="resetPosition">
          <el-icon><Refresh /></el-icon>
          <span>重置</span>
        </div>
      </div>
      <div class="section-content">
        <div class="control-item">
          <div class="control-content render-controls">
            <div class="render-option">
              <span>X轴</span>
              <div class="position-control">
                <el-slider
                  v-model="position.x"
                  :min="-100"
                  :max="100"
                  :step="1"
                  :format-tooltip="val => `${val}`"
                  @change="updatePosition"
                />
                <span class="position-value">{{ position.x }}</span>
              </div>
            </div>
            <div class="render-option">
              <span>Y轴</span>
              <div class="position-control">
                <el-slider
                  v-model="position.y"
                  :min="-100"
                  :max="100"
                  :step="1"
                  :format-tooltip="val => `${val}`"
                  @change="updatePosition"
                />
                <span class="position-value">{{ position.y }}</span>
              </div>
            </div>
            <div class="render-option">
              <span>Z轴</span>
              <div class="position-control">
                <el-slider
                  v-model="position.z"
                  :min="-100"
                  :max="100"
                  :step="1"
                  :format-tooltip="val => `${val}`"
                  @change="updatePosition"
                />
                <span class="position-value">{{ position.z }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="control-section">
      <div class="section-header">
        <el-icon><DCaret /></el-icon>
        <span>模型旋转</span>
        <div class="reset-link" @click="resetRotation">
          <el-icon><Refresh /></el-icon>
          <span>重置</span>
        </div>
      </div>
      <div class="section-content">
        <div class="control-item">
          <div class="control-content render-controls">
            <div class="render-option">
              <span>X轴</span>
              <div class="position-control">
                <el-slider
                  v-model="rotation.x"
                  :min="-180"
                  :max="180"
                  :step="1"
                  :format-tooltip="val => `${val}°`"
                  @change="updateRotation"
                />
                <span class="position-value">{{ rotation.x }}°</span>
              </div>
            </div>
            <div class="render-option">
              <span>Y轴</span>
              <div class="position-control">
                <el-slider
                  v-model="rotation.y"
                  :min="-180"
                  :max="180"
                  :step="1"
                  :format-tooltip="val => `${val}°`"
                  @change="updateRotation"
                />
                <span class="position-value">{{ rotation.y }}°</span>
              </div>
            </div>
            <div class="render-option">
              <span>Z轴</span>
              <div class="position-control">
                <el-slider
                  v-model="rotation.z"
                  :min="-180"
                  :max="180"
                  :step="1"
                  :format-tooltip="val => `${val}°`"
                  @change="updateRotation"
                />
                <span class="position-value">{{ rotation.z }}°</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, reactive } from 'vue'
import { InfoFilled, Monitor, Position, Refresh, DCaret } from '@element-plus/icons-vue'
import type { SceneEvents } from '../../config/eventKeys'
import { SCENE_EVENTS_KEY } from '../../config/eventKeys'
import { defaultHelperConfig } from '../../config/helperConfig'
import { defaultPredefineColors } from '../../config/colorConfig'
import { defaultModelConfig } from '../../config/modelConfig'

// 使用 reactive 管理辅助工具配置
const gridOptions = reactive({ ...defaultHelperConfig.grid })
const axesOptions = reactive({ ...defaultHelperConfig.axes })
const statsOptions = reactive({ ...defaultHelperConfig.stats })

const sceneEvents = inject<SceneEvents>(SCENE_EVENTS_KEY)

// 使用预设颜色
const predefineColors = ref(defaultPredefineColors)

// 网格颜色控制方法
const handleGridColorChange = (color: string) => {
  if (gridOptions.show) {
    sceneEvents?.updateGridColor(color)
  }
}

// 模型位置状态
const position = reactive({ ...defaultModelConfig.position })

// 更新位置
const updatePosition = () => {
  sceneEvents?.updateModelPosition(position)
}

// 重置位置
const resetPosition = () => {
  const { x, y, z } = defaultModelConfig.position
  position.x = x
  position.y = y
  position.z = z
  updatePosition()
}

// 模型旋转状态
const rotation = reactive({ ...defaultModelConfig.rotation })

// 更新旋转
const updateRotation = () => {
  // 将角度转换为弧度
  const radians = {
    x: (rotation.x * Math.PI) / 180,
    y: (rotation.y * Math.PI) / 180,
    z: (rotation.z * Math.PI) / 180,
  }
  sceneEvents?.updateModelRotation(radians)
}

// 重置旋转
const resetRotation = () => {
  const { x, y, z } = defaultModelConfig.rotation
  rotation.x = x
  rotation.y = y
  rotation.z = z
  updateRotation()
}
</script>

<style lang="scss" scoped>
@use './style.scss';

.render-controls {
  background: var(--el-fill-color);
  .render-group {
    position: relative;
    padding: 6px;
    background: var(--el-fill-color-light);
    border-radius: 8px;
    transition: all 0.3s ease;
    .render-option {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 32px;

      span {
        color: var(--el-text-color-primary);
        font-size: 14px;
      }

      .axes-label {
        display: flex;
        align-items: center;
        gap: 4px;

        .info-icon {
          color: var(--el-text-color-secondary);
          font-size: 14px;
          transition: color 0.3s ease;

          &:hover {
            color: var(--el-color-primary);
          }
        }
      }

      &.disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }
    }
  }
}
</style>
