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
        @reset-camera="resetCamera"
        @take-screenshot="takeScreenshot"
        @start-animation="handleStartAnimation"
        @pause-animation="handlePauseAnimation"
        @reset-animation="handleResetAnimation"
        @toggle-grid="handleToggleGrid"
        @toggle-stats="handleToggleStats"
        @scale-change="handleScaleChange"
        @light-change="handleLightChange"
        @shadow-change="handleShadowChange"
        @light-angle-change="handleLightAngleChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import * as THREE from 'three'

import { useThreeScene } from './hooks/useThreeScene'
import { useFBXModel } from './hooks/useFBXModel'
import { useModelAnimation } from './hooks/useModelAnimation'
import { useThreeLights } from './hooks/useThreeLights'

import LoadingSpinner from './components/LoadingSpinner.vue'
import ModelControls from './components/ModelControls.vue'
import type { IModelControls } from './types'

const {
  threeContainer,
  scene,
  resetCamera,
  renderer,
  initScene,
  toggleGrid,
  toggleStats
} = useThreeScene({
  showGrid: true,
  showStats: true,
  backgroundColor: 0xf0f2f5
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

const { lights, updateLightIntensity, updateShadowEnabled, addLightsToScene, updateLightAngle } = useThreeLights()

// 初始化模型控制状态
const modelControls = ref<IModelControls>({
  scale: 1,
  isPlaying: false,
  wireframe: false,
  lights: {
    ambientIntensity: 0.5,
    mainLightIntensity: 1.0,
    fillLightIntensity: 0.3,
    hemiLightIntensity: 0.2,
    shadowEnabled: true,
    mainLightAngle: {
      x: 45,
      y: 45,
      z: 0
    },
    fillLightAngle: {
      x: 45,
      y: -45,
      z: 0
    }
  }
})

// 保存模型引用
const modelRef = ref<THREE.Group | null>(null)
let mixer: THREE.AnimationMixer
let animations: THREE.AnimationAction[] = []

// 修改缩放处理函数
const handleScaleChange = (scale: number) => {
  if (modelRef.value) {
    modelRef.value.scale.setScalar(scale)
  }
}

// 处理光源强度变化
const handleLightChange = (lightType: string, intensity: number) => {
  console.log('光源变化:', lightType, intensity)
  switch(lightType) {
    case 'ambientLight':
      updateLightIntensity('ambientLight', intensity)
      break
    case 'mainLight':
      updateLightIntensity('mainLight', intensity)
      break
    case 'fillLight':
      updateLightIntensity('fillLight', intensity)
      break
    case 'hemiLight':
      updateLightIntensity('hemiLight', intensity)
      break
  }
}

// 处理阴影开关
const handleShadowChange = (enabled: boolean) => {
  updateShadowEnabled(enabled)
}

// 修改初始化模型函数
const initModel = async () => {
  try {
    console.log('开始初始化场景...')
    await initScene()
    
    await new Promise(resolve => requestAnimationFrame(resolve))
    
    if (scene.value) {
      // 确保光源已经添加到场景中
      if (!lights.value) {
        addLightsToScene(scene.value)
      }

      // 初始化光源强度
      Object.entries(modelControls.value.lights).forEach(([key, value]) => {
        if (key !== 'shadowEnabled') {
          handleLightChange(key, value as number)
        }
      })

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

// 添加光源角度变化处理函数
const handleLightAngleChange = (
  lightType: string,
  angle: { x: number; y: number; z: number }
) => {
  updateLightAngle(lightType as 'mainLight' | 'fillLight', angle)
}

onMounted(() => {
  nextTick(() => {
    initModel()
  })
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