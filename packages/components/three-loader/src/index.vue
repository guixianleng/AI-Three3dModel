<template>
  <div class="three-container">
    <LoadingSpinner
      v-if="loading"
      :progress="loadingProgress"
      :auto-change-text="true"
      :text-change-interval="2000"
    />

    <div ref="threeContainer" class="canvas-container"></div>

    <ModelControls 
      :model-controls="modelControls" 
      :update-materials="updateMaterials"
      class="model-controls" 
    />
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
  updateControlsOptions,
  updateMaterials,
} = useThreeScene({
  lights: defaultLightConfig,
  helper: defaultHelperConfig,
})

/**
 * 初始化场景和模型
 */
const initModel = async () => {
  try {
    await initScene('/glb-9.glb')
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
  updateControlsOptions,
  updateMaterial: (options) => {
    try {
      const { name, property, value } = options
      
      // 如果是更新所有材质
      if (name === 'all') {
        modelControls.materials.forEach(mat => {
          mat[property] = value
          updateMaterials({
            name: mat.name,
            property,
            value
          })
        })
        return
      }

      // 更新单个材质
      const material = modelControls.materials.find(m => m.name === name)
      if (material) {
        material[property] = value
        updateMaterials(options)
      }
    } catch (error) {
      console.error('更新材质失败:', error)
    }
  },
  convertMaterial: (materialName: string, type: MaterialType) => {
    try {
      // 更新所有材质的类型
      modelControls.materials.forEach(material => {
        updateMaterials({
          name: material.name,
          property: 'type',
          value: type
        })
      })
    } catch (error) {
      console.error('转换材质失败:', error)
    }
  },
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
  display: flex;
  overflow: hidden;

  .canvas-container {
    flex: 2;
    height: 100%;
    position: relative;
    background-color: #f0f2f5;

    canvas {
      width: 100% !important;
      height: 100% !important;
    }
  }

  .model-controls {
    flex-basis: 400px;
    flex-shrink: 0;
  }
}
</style>
