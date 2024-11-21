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
import { ref, onMounted, provide } from 'vue'
import * as THREE from 'three'

// Hooks
import { useThreeScene } from './hooks/useThreeScene'
import { useFBXModel } from './hooks/useFBXModel'
import { useModelAnimation } from './hooks/useModelAnimation'

// 组件
import LoadingSpinner from './components/LoadingSpinner.vue'
import ModelControls from './components/ModelControls.vue'

// 类型和配置
import type { IModelControls } from './types'
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
  updateLight
} = useThreeScene({
  backgroundColor: 0xf0f2f5,
  lights: defaultLightConfig,
  helper: defaultHelperConfig
})

// 模型管理
const {
  loading,
  loadingProgress,
  loadModel
} = useFBXModel()

// 动画管理
const {
  modelControls,
  startAnimation,
  pauseAnimation,
  resetAnimation,
  updateAnimation
} = useModelAnimation()

// 模型引用
const modelRef = ref<THREE.Group | null>(null)
let mixer: THREE.AnimationMixer
let animations: THREE.AnimationAction[] = []

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
      const result = await loadModel(modelUrl, scene.value)
      console.log('模型加载成功')
      
      modelRef.value = result.model
      mixer = result.mixer
      animations = result.animations

      // 添加动画更新循环
      const animateLoop = () => {
        requestAnimationFrame(animateLoop)
        if (mixer) {
          updateAnimation(mixer)
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

// 事件处理函数
const handleStartAnimation = () => {
  if (mixer && animations.length) {
    startAnimation(mixer, animations)
  }
}

const handlePauseAnimation = () => {
  if (mixer) {
    pauseAnimation(mixer)
  }
}

const handleResetAnimation = () => {
  if (mixer) {
    resetAnimation(mixer)
  }
}

const handleScaleChange = (scale: number) => {
  if (modelRef.value) {
    modelRef.value.scale.setScalar(scale)
  }
}

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

const handleUpdateModelPosition = (position: { x: number, y: number, z: number }) => {
  if (modelRef.value) {
    modelRef.value.position.set(position.x, position.y, position.z)
  }
}

const handleUpdateGridColor = (color: string) => {
  if (scene.value) {
    const gridHelper = scene.value.getObjectByName('GridHelper') as THREE.GridHelper
    if (gridHelper) {
      (gridHelper.material as THREE.Material).color.set(color)
      console.log('网格颜色已更新:', color)
    }
  }
}

// 提供场景事件
provide<SceneEvents>(SCENE_EVENTS_KEY, {
  resetView,
  takeScreenshot,
  startAnimation: handleStartAnimation,
  pauseAnimation: handlePauseAnimation,
  resetAnimation: handleResetAnimation,
  toggleGrid,
  toggleStats,
  toggleAxes,
  toggleFloor,
  updateFloorColor,
  updateBackgroundColor: setBackgroundColor,
  scaleChange: handleScaleChange,
  lightChange: handleLightChange,
  updateModelPosition: handleUpdateModelPosition,
  updateGridColor: handleUpdateGridColor
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