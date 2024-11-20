<template>
  <div class="control-sections">
    <div class="control-section">
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
              <span>坐标轴辅助线</span>
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
              <span>背景颜色</span>
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
  </div>
</template>

<script setup lang="ts">
import { ref, inject } from 'vue'
import type { SceneEvents } from '../../config/eventKeys'
import { SCENE_EVENTS_KEY } from '../../config/eventKeys'
import { defaultHelperConfig } from '../../config/helperConfig'

// 使用 defaultHelperConfig 的初始值
const showGrid = ref(defaultHelperConfig.showGrid)
const showAxes = ref(defaultHelperConfig.showAxes)
const showStats = ref(defaultHelperConfig.showStats)
const showFloor = ref(defaultHelperConfig.showFloor)
const floorColor = ref(defaultHelperConfig.floorColor?.toString())
const backgroundColor = ref('#f0f2f5')

const sceneEvents = inject<SceneEvents>(SCENE_EVENTS_KEY)

// 预设颜色
const predefineColors = ref([
  '#cccccc',  // 默认灰色
  '#ffffff',  // 白色
  '#f5f5f5',  // 浅灰色
  '#e0e0e0',  // 中灰色
  '#d3d3d3',  // 亮灰色
  '#a9a9a9'   // 深灰色
])

const handleFloorColorChange = (color: string) => {
  if (showFloor.value) {
    sceneEvents?.updateFloorColor(color)
  }
}

const handleBackgroundColorChange = (color: string) => {
  sceneEvents?.updateBackgroundColor(color)
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

    span {
      font-size: 13px;
      color: var(--el-text-color-regular);
    }
  }
}
</style> 