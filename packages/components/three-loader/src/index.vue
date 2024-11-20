<template>
  <div class="three-container">
    <LoadingSpinner 
      v-if="loading"
      :progress="loadingProgress"
      :auto-change-text="true"
      :text-change-interval="2000"
    />

    <div ref="threeContainer" class="canvas-container"></div>
    
    <div class="control-panel" v-show="!loading">
      <ModelControls 
        :model-controls="modelControls"
        @reset-view="resetView"
        @take-screenshot="takeScreenshot"
        @start-animation="handleStartAnimation"
        @pause-animation="handlePauseAnimation"
        @reset-animation="handleResetAnimation"
        @toggle-grid="handleToggleGrid"
        @toggle-stats="handleToggleStats"
        @toggle-axes="handleToggleAxes"
        @toggle-floor="handleToggleFloor"
        @update-floor-color="handleUpdateFloorColor"
        @scale-change="handleScaleChange"
        @light-change="handleLightChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import * as THREE from 'three'

import { useThreeScene } from './hooks/useThreeScene'
import { useFBXModel } from './hooks/useFBXModel'
import { useModelAnimation } from './hooks/useModelAnimation'
import { useThreeLights } from './hooks/useThreeLights'

import LoadingSpinner from './components/LoadingSpinner.vue'
import ModelControls from './components/ModelControls.vue'
import type { IModelControls } from './types'
import { defaultLightConfig } from './config/lightConfig'

const {
  threeContainer,
  scene,
  resetView,
  renderer,
  initScene,
  toggleGrid,
  toggleStats,
  toggleAxes,
  toggleFloor,
  updateFloorColor,
  updateLight
} = useThreeScene({
  showGrid: true,
  showStats: true,
  backgroundColor: 0xf0f2f5,
  lights: defaultLightConfig
})

const {
  loading,
  loadingProgress,
  loadModel
} = useFBXModel()

const {
  startAnimation,
  pauseAnimation,
  resetAnimation,
  updateAnimation
} = useModelAnimation()

// 初始化模型控制状态
const modelControls = ref<IModelControls>({
  scale: 0.5,
  isPlaying: false,
  wireframe: false,
  lights: defaultLightConfig
})

// 保存模型引用
const modelRef = ref<THREE.Group | null>(null)
let mixer: THREE.AnimationMixer
let animations: THREE.AnimationAction[] = []

// 初始化模型
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
    } else {
      throw new Error('场景初始化失败')
    }
  } catch (error) {
    console.error('加载模型失败:', error)
  }
}

// 截图功能
const takeScreenshot = () => {
  if (!renderer) return
  const link = document.createElement('a')
  link.download = 'screenshot.png'
  link.href = renderer.domElement.toDataURL('image/png')
  link.click()
}

// 动画控制方法
const handleStartAnimation = () => {
  if (mixer && animations.length) {
    startAnimation(mixer, animations)
    modelControls.value.isPlaying = true
  }
}

const handlePauseAnimation = () => {
  if (mixer) {
    pauseAnimation(mixer)
    modelControls.value.isPlaying = false
  }
}

const handleResetAnimation = () => {
  if (mixer) {
    resetAnimation(mixer)
    modelControls.value.isPlaying = false
  }
}

// 网格和性能监控的控制方法
const handleToggleGrid = (show: boolean) => {
  toggleGrid(show)
}

const handleToggleStats = (show: boolean) => {
  toggleStats(show)
}

const handleToggleAxes = (show: boolean) => {
  toggleAxes(show)
}

// 添加地板显示/隐藏处理函数
const handleToggleFloor = (show: boolean) => {
  toggleFloor(show)
}

// 修改缩放处理函数
const handleScaleChange = (scale: number) => {
  if (modelRef.value) {
    modelRef.value.scale.setScalar(scale)
  }
}

// 修改光源处理函数
const handleLightChange = (lightType: string, property: string, value: any) => {
  // 更新控制状态
  if (lightType in modelControls.value.lights) {
    const light = modelControls.value.lights[lightType]
    switch (property) {
      case 'enabled':
        light.enabled = value
        break
      case 'intensity':
        light.intensity = value
        break
      case 'color':
        light.color = value
        break
      case 'position':
        if ('position' in light) {
          light.position = value
        }
        break
    }
  }
}

// 添加地板颜色更新处理函数
const handleUpdateFloorColor = (color: string) => {
  updateFloorColor(color)
}

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
  
  .control-panel {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 320px;
    z-index: 10;
  }
}
</style> 