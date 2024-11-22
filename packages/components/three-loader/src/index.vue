<template>
  <div class="three-container">
    <LoadingSpinner
      v-if="loading"
      :progress="loadingProgress"
      :auto-change-text="true"
      :text-change-interval="2000"
    />

    <div ref="threeContainer" class="canvas-container"></div>

    <ModelControls :model-controls="modelControls" class="model-controls" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, provide } from 'vue'

// Hooks
import { useThreeScene } from './hooks/useThreeScene'

// 组件
import LoadingSpinner from './components/LoadingSpinner.vue'
import ModelControls from './components/ModelControls.vue'

// 配置
import { defaultLightConfig } from './config/lightConfig'
import { defaultHelperConfig } from './config/helperConfig'
import { SCENE_EVENTS_KEY, type SceneEvents } from './config/eventKeys'

// 场景管理
const {
  threeContainer,
  loading,
  loadingProgress,
  modelControls,
  initScene,
  resetView,
  toggleGrid,
  updateGridColor,
  toggleStats,
  toggleAxes,
  toggleFloor,
  startAnimation,
  pauseAnimation,
  resetAnimation,
  updatePosition,
  updateRotation,
  updateFloorColor,
  updateBackground,
  updateLight,
  updateFloorOpacity,
} = useThreeScene({
  lights: defaultLightConfig,
  helper: defaultHelperConfig,
})

/**
 * 初始化场景和模型
 */
const initModel = async () => {
  try {
    await initScene()
  } catch (error) {
    console.error('初始化失败:', error)
  }
}

/**
 * 截图功能
 */
const takeScreenshot = () => {
  const link = document.createElement('a')
  link.download = 'screenshot.png'
  link.href = threeContainer.value?.querySelector('canvas')?.toDataURL('image/png') || ''
  link.click()
}

// 修改光源处理函数
const handleLightChange = (lightType: string, property: string, value: any) => {
  try {
    // 更新控制状态
    if (lightType in modelControls.lights) {
      const light = modelControls.lights[lightType]
      if (property.includes('.')) {
        const [prop, subProp] = property.split('.')
        light[prop][subProp] = value
      } else {
        light[property] = value
      }

      // 更新场景中的光源
      updateLight(lightType, light)
      console.log(`光源 ${lightType} 已更新:`, { property, value })
    }
  } catch (error) {
    console.error('更新光源失败:', error)
  }
}

// 提供场景事件
provide<SceneEvents>(SCENE_EVENTS_KEY, {
  resetView,
  takeScreenshot,
  startAnimation,
  pauseAnimation,
  resetAnimation,
  toggleGrid,
  updateGridColor,
  toggleStats,
  toggleAxes,
  toggleFloor,
  updateFloorColor,
  updateBackground,
  lightChange: handleLightChange,
  updateModelPosition: updatePosition,
  updateModelRotation: updateRotation,
  updateFloorOpacity,
})

// 初始化
onMounted(() => {
  initModel()
})
</script>

<style lang="scss" scoped>
.three-container {
  position: relative;
  width: 100%;
  height: 100%;

  .canvas-container {
    width: 100%;
    height: 100%;
    position: relative;
    background-color: #f0f2f5;

    canvas {
      width: 100% !important;
      height: 100% !important;
    }
  }

  .model-controls {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    width: 320px;
    z-index: 99;
  }
}

// 暗黑模式适配
:deep(html.dark) {
  .canvas-container {
    background-color: #1a1a1a;
  }
}
</style>
