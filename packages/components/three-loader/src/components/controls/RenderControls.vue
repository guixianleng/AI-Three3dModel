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
            <div class="render-option">
              <span>网格辅助线</span>
              <el-switch
                v-model="showGrid"
                @change="sceneEvents?.toggleGrid(showGrid)"
              />
            </div>
            <div class="render-option">
              <span>网格颜色</span>
              <el-color-picker
                v-model="gridColor"
                show-alpha
                size="small"
                :predefine="predefineColors"
                @change="handleGridColorChange"
                :disabled="!showGrid"
              />
            </div>
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
              <el-switch
                v-model="showAxes"
                @change="sceneEvents?.toggleAxes(showAxes)"
              />
            </div>
            <div class="render-option">
              <span>显示地板</span>
              <el-switch
                v-model="showFloor"
                @change="sceneEvents?.toggleFloor(showFloor)"
              />
            </div>
            <div class="render-option">
              <span>地板颜色</span>
              <el-color-picker
                v-model="floorColor"
                show-alpha
                size="small"
                :predefine="predefineColors"
                @change="handleFloorColorChange"
                :disabled="!showFloor"
              />
            </div>
            <div class="render-option">
              <span>性能监控</span>
              <el-switch
                v-model="showStats"
                @change="sceneEvents?.toggleStats(showStats)"
              />
            </div>
            <div class="render-option">
              <span>场景背景色</span>
              <el-color-picker
                v-model="backgroundColor"
                show-alpha
                size="small"
                :predefine="predefineColors"
                @change="handleBackgroundColorChange"
              />
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
                  :format-tooltip="(val) => `${val}`"
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
                  :format-tooltip="(val) => `${val}`"
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
                  :format-tooltip="(val) => `${val}`"
                  @change="updatePosition"
                />
                <span class="position-value">{{ position.z }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, inject } from 'vue'
import { InfoFilled, Monitor, Position, Refresh } from '@element-plus/icons-vue'
import type { SceneEvents } from '../../config/eventKeys'
import { SCENE_EVENTS_KEY } from '../../config/eventKeys'
import { defaultHelperConfig } from '../../config/helperConfig'
import { defaultPredefineColors } from '../../config/colorConfig'  // 导入预设颜色

// 使用 defaultHelperConfig 的初始值
const showGrid = ref(defaultHelperConfig.showGrid)
const gridColor = ref(defaultHelperConfig.gridColor)
const showAxes = ref(defaultHelperConfig.showAxes)
const showStats = ref(defaultHelperConfig.showStats)
const showFloor = ref(defaultHelperConfig.showFloor)
const floorColor = ref(defaultHelperConfig.floorColor)
const backgroundColor = ref('#f0f2f5')

const sceneEvents = inject<SceneEvents>(SCENE_EVENTS_KEY)

// 使用预设颜色
const predefineColors = ref(defaultPredefineColors)

const handleFloorColorChange = (color: string) => {
  if (showFloor.value) {
    sceneEvents?.updateFloorColor(color)
  }
}

const handleBackgroundColorChange = (color: string) => {
  sceneEvents?.updateBackgroundColor(color)
}

const handleGridColorChange = (color: string) => {
  if (showGrid.value) {
    sceneEvents?.updateGridColor(color)
  }
}

// 模型位置状态
const position = reactive({ ...defaultHelperConfig.modelPosition })

// 更新位置
const updatePosition = () => {
  sceneEvents?.updateModelPosition(position)
}

// 重置位置
const resetPosition = () => {
  const { x = 0, y = 0, z = 0 } = defaultHelperConfig.modelPosition
  position.x = x
  position.y = y
  position.z = z
  updatePosition()
}
</script>

<style lang="scss" scoped>
.render-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 12px 16px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  transition: all 0.3s ease;

  &:hover {
    background: var(--el-fill-color);
  }

  .render-option {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;

    span {
      font-size: 13px;
      color: var(--el-text-color-regular);
    }

    .position-control {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 4px;

      .el-slider {
        flex: 1;
      }

      .position-value {
        min-width: 20px;
        text-align: right;
        font-family: monospace;
        font-size: 13px;
        color: var(--el-text-color-secondary);
      }
    }

    .axes-label {
      display: flex;
      align-items: center;
      gap: 4px;
      cursor: help;

      .info-icon {
        font-size: 14px;
        color: var(--el-text-color-secondary);
      }
    }
  }
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 0 4px;

  .el-icon {
    font-size: 16px;
    color: var(--el-text-color-primary);
  }

  span {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  .reset-link {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: var(--el-color-primary);
    cursor: pointer;
    transition: all 0.3s ease;

    .el-icon {
      font-size: 14px;
      color: var(--el-color-primary);
    }

    span {
      font-size: 12px;
      font-weight: normal;
      color: var(--el-color-primary);
    }
  }
}

.control-section {
  background: var(--el-fill-color-blank);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

  &:last-child {
    margin-bottom: 0;
  }
}

// 调整滑块样式
:deep(.el-slider) {
  --el-slider-button-size: 16px;
  --el-slider-height: 4px;
}
</style> 