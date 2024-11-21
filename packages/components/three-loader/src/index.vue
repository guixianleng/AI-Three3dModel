<template>
  <div class="three-container">
    <!-- 加载动画 -->
    <LoadingSpinner 
      v-if="loading"
      :progress="loadingProgress"
      :auto-change-text="true"
      :text-change-interval="2000"
    />

    <!-- Three.js 渲染容器 -->
    <div ref="threeContainer" class="canvas-container"></div>
    
    <!-- 模型控制面板 -->
    <ModelControls 
      :model-controls="modelControls"
      class="model-controls"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, provide } from 'vue'

// Hooks
import { useThreeScene } from './hooks/useThreeScene'
import { useThreeModel } from './hooks/useThreeModel'
import { useModelAnimation } from './hooks/useModelAnimation'

// 组件
import LoadingSpinner from './components/LoadingSpinner.vue'
import ModelControls from './components/ModelControls.vue'

// 类型和配置
import { defaultLightConfig } from './config/lightConfig'
import { defaultHelperConfig } from './config/helperConfig'
import { SCENE_EVENTS_KEY, type SceneEvents } from './config/eventKeys'

// 场景管理
const {
  threeContainer,
  scene,
  resetView,
  initScene,
  toggleGrid,
  toggleStats,
  toggleAxes,
  toggleFloor,
  updateFloorColor,
  setBackgroundColor,
  updateLight,
  updateBackground
} = useThreeScene({
  lights: defaultLightConfig,
  helper: defaultHelperConfig
})

// 模型管理
const {
  loading,
  loadingProgress,
  mixer,
  animations,
  loadModel,
  updatePosition,
  updateRotation,
  updateScale,
  dispose: disposeModel
} = useThreeModel({
  useDraco: true,
  textureCompression: false,
  optimizeGeometry: false
})

// 动画管理
const {
  modelControls,
  startAnimation,
  pauseAnimation,
  resetAnimation,
  updateAnimation
} = useModelAnimation()

/**
 * 初始化模型
 */
const initModel = async () => {
  try {
    console.log('开始初始化场景...')
    await initScene()
    
    if (scene.value) {
      console.log('场景初始化成功，开始加载模型...')
      const modelUrl = 'https://threejs.org/examples/models/fbx/Samba%20Dancing.fbx'
      await loadModel(modelUrl, scene.value)

      // 添加动画更新循环
      const animateLoop = () => {
        requestAnimationFrame(animateLoop)
        if (mixer.value) {
          updateAnimation(mixer.value)
        }
      }
      animateLoop()
    }
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

// 提供场景事件
provide<SceneEvents>(SCENE_EVENTS_KEY, {
  resetView,
  takeScreenshot,
  startAnimation: () => startAnimation(mixer.value!, animations.value),
  pauseAnimation: () => pauseAnimation(mixer.value!),
  resetAnimation: () => resetAnimation(mixer.value!),
  toggleGrid,
  toggleStats,
  toggleAxes,
  toggleFloor,
  updateFloorColor,
  updateBackground,
  updateBackgroundColor: setBackgroundColor,
  scaleChange: updateScale,
  lightChange: updateLight,
  updateModelPosition: updatePosition,
  updateModelRotation: updateRotation,
  updateGridColor: (color: string) => {
    if (scene.value) {
      const gridHelper = scene.value.getObjectByName('GridHelper') as THREE.GridHelper
      if (gridHelper) {
        (gridHelper.material as THREE.Material).color.set(color)
      }
    }
  }
})

// 生命周期钩子
onMounted(() => {
  initModel()
})

onBeforeUnmount(() => {
  // 清理模型资源
  disposeModel()
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