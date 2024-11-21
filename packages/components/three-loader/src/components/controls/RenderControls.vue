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
                  :format-tooltip="(val) => `${val}°`"
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
                  :format-tooltip="(val) => `${val}°`"
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
                  :format-tooltip="(val) => `${val}°`"
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
import { ref, reactive, inject } from 'vue'
import { InfoFilled, Monitor, Position, Refresh, DCaret } from '@element-plus/icons-vue'
import type { SceneEvents } from '../../config/eventKeys'
import { SCENE_EVENTS_KEY } from '../../config/eventKeys'
import { defaultHelperConfig } from '../../config/helperConfig'
import { defaultPredefineColors } from '../../config/colorConfig'
import { modelLoadConfig } from '../../config/modelConfig'

// 使用 defaultHelperConfig 的初始值
const showGrid = ref(defaultHelperConfig.showGrid)
const gridColor = ref(defaultHelperConfig.gridColor)
const showAxes = ref(defaultHelperConfig.showAxes)
const showStats = ref(defaultHelperConfig.showStats)
const showFloor = ref(defaultHelperConfig.showFloor)
const floorColor = ref(defaultHelperConfig.floorColor)

const sceneEvents = inject<SceneEvents>(SCENE_EVENTS_KEY)

// 使用预设颜色
const predefineColors = ref(defaultPredefineColors)

const handleFloorColorChange = (color: string) => {
  if (showFloor.value) {
    sceneEvents?.updateFloorColor(color)
  }
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

// 模型旋转状态
const rotation = reactive({
  x: modelLoadConfig.rotation.x,
  y: modelLoadConfig.rotation.y,
  z: modelLoadConfig.rotation.z
})

// 更新旋转
const updateRotation = () => {
  // 将角度转换为弧度
  const radians = {
    x: (rotation.x * Math.PI) / 180,
    y: (rotation.y * Math.PI) / 180,
    z: (rotation.z * Math.PI) / 180
  }
  sceneEvents?.updateModelRotation(radians)
}

// 重置旋转
const resetRotation = () => {
  rotation.x = modelLoadConfig.rotation.x
  rotation.y = modelLoadConfig.rotation.y
  rotation.z = modelLoadConfig.rotation.z
  updateRotation()
}
</script>

<style lang="scss" scoped>
@use './style.scss';
</style> 