<template>
  <div class="three-container">
    <LoadingSpinner 
      v-if="loading"
      :texts="[
        '正在加载模型...',
        '初始化场景...',
        '准备渲染...',
        '马上就好...'
      ]"
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

import LoadingSpinner from './components/LoadingSpinner.vue'
import ModelControls from './components/ModelControls.vue'

const {
  threeContainer,
  scene,
  resetCamera,
  renderer,
  initScene,
  toggleGrid,
  toggleStats
} = useThreeScene({
  showGrid: true,  // 默认显示网格
  showStats: true, // 默认显示性能监控
  backgroundColor: 0xf0f2f5
})

const {
  loading,
  loadingProgress,
  loadModel
} = useFBXModel()

const {
  modelControls,
  startAnimation,
  pauseAnimation,
  resetAnimation,
  updateAnimation
} = useModelAnimation()

// 加载模型并初始化动画
let mixer: THREE.AnimationMixer
let animations: THREE.AnimationAction[] = []

// 保存模型引用
const modelRef = ref<THREE.Group | null>(null)

// 修改缩放处理函数，只缩放模型
const handleScaleChange = (scale: number) => {
  if (modelRef.value) {
    modelRef.value.scale.setScalar(scale)
  }
}

// 修改初始化模型函数，保存模型引用
const initModel = async () => {
  try {
    console.log('开始初始化场景...')
    await initScene()
    
    await new Promise(resolve => requestAnimationFrame(resolve))
    
    if (scene.value) {
      console.log('场景初始化成功，开始加载模型...')
      const modelUrl = 'https://threejs.org/examples/models/fbx/Samba%20Dancing.fbx'
      const result = await loadModel(modelUrl, scene.value)
      console.log('模型加载成功:')
      
      modelRef.value = result.model // 保存模型引用
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

onMounted(() => {
  // 等待 DOM 更新完成后再初始化
  nextTick(() => {
    initModel()
  })
})

// 截图功能
const takeScreenshot = () => {
  const link = document.createElement('a')
  link.download = 'screenshot.png'
  link.href = renderer.domElement.toDataURL('image/png')
  link.click()
}

// 修改动画控制方法，传入 mixer 和 animations
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

// 添加网格和性能监控的控制方法
const handleToggleGrid = (show: boolean) => {
  toggleGrid(show)
}

const handleToggleStats = (show: boolean) => {
  toggleStats(show)
}
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